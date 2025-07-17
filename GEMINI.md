This file provides context for the AI assistant to understand the architecture and conventions of the `wallsite` project.

## 1. Project Overview

This is a self-hostable wallpaper gallery project. Its primary goal is to be distributed as a user-friendly GitHub template, allowing others to easily create and deploy their own galleries. The project supports two main deployment methods: a simple Git-based deployment via Vercel/Netlify and an advanced self-hosted deployment via Docker.

## 2. Core Technologies

- **Frontend:** Vanilla JavaScript (ESM), HTML, CSS. The frontend is built without a major framework, using ES modules for organization.
    - **`basicLightbox`**: For the full-screen image viewer.
    - **`@vercel/analytics` & `@vercel/speed-insights`**: For analytics, if deployed on Vercel.
- **Build Tool:** `esbuild` is used for bundling JavaScript and CSS, with optimized configurations for development (watch mode, incremental builds) and production (minification, tree-shaking).
- **Package Manager:** `pnpm`.
- **Image Processing:** `ImageMagick` is a required dependency for the generation scripts. It handles thumbnail creation and responsive image resizing.
- **Automation:** GitHub Actions are used for syncing the template repository and publishing the Docker image.
- **Containerization:** Docker is used for the self-hosting option, with a `docker-compose.yml` for easy setup.
- **Development Environment:** A `flake.nix` file is provided for setting up a reproducible development environment with Nix.

## 3. Key Architectural Concepts

### The Two-Repository System

This project uses two separate repositories:

1.  **`wallsite` (This Repository):**
    - The main development repository and live demo.
    - Contains the developer's own wallpapers in the `/src` folder.
    - Contains all workflows, including `publish-docker.yml` and `sync-template.yml`.

2.  **`wallsite-template` (The User-Facing Template):**
    - The repository that users generate from.
    - Automatically kept in sync with `wallsite` by the `sync-template.yml` workflow.
    - Its `/src` folder is kept empty (with a placeholder `README.md`).
    - Its `README.md` is different and contains user-facing deployment instructions.
    - Does not contain developer-specific workflows.

### Core Automation Workflows

- **`sync-template.yml`:** Runs in the main `wallsite` repo. It copies all relevant files (excluding `/src` and specific developer workflows) to the `wallsite-template` repo.
- **`publish-docker.yml`:** Runs in the main `wallsite` repo to build and publish the Docker image to the GitHub Container Registry (GHCR).

### Dynamic Docker Deployment

The Docker setup uses a single-stage `Dockerfile` with a custom `docker-entrypoint.sh` script. The gallery is generated **at runtime** when a user runs the container with their wallpaper directory mounted to `/app/src`. This allows for dynamic updates without rebuilding the image.

## 4. File Structure Overview

- `src/`: Contains the source wallpaper images, organized in subdirectories.
- `docs/`: Contains the source code for the frontend application (HTML, CSS, JS). This is the directory to edit during development.
- `public/`: The output directory for the build process. **Do not edit files here directly.**
- `scripts/`: Contains the core generation scripts.
    - `generate_gallery.sh`: A highly optimized bash script that uses ImageMagick to create responsive WebP versions of all images. It intelligently skips processing images that already exist and are up-to-date, dramatically speeding up builds.
    - `generate_data.mjs`: A Node.js script that scans the `src` directory and creates `docs/js/gallery-data.js` with all the metadata for the frontend.
- `.github/workflows/`: Contains the GitHub Actions workflows.
- `Dockerfile` & `docker-entrypoint.sh`: Define the Docker image and its runtime behavior.

## 5. Development Rules & Conventions

- **Rule 1: Never edit generated files directly.** The `public/` directory and the `docs/js/gallery-data.js` file are generated artifacts. To update them, run `pnpm run build` or `pnpm run dev`.
- **Rule 2: The template repository is sacred.** Do not make manual changes to the `wallsite-template` repository. All changes are synced from the main `wallsite` repository.
- **Rule 3: The user experience is paramount.** The main `README.md` is for developers and directs users to the template. The template's `README.md` provides the actual deployment steps for the user.
- **Rule 4: Emphasize pure functions and separation of concerns.** The frontend JavaScript is organized into modules with specific responsibilities:
    - `main.js`: The main application entry point. Initializes the app, builds the hierarchical data structure from the flat `galleryData`, and wires up event listeners.
    - `state.js`: Manages the application's state, including the list of wallpapers, favorites, and UI element references.
    - `gallery.js`: Handles rendering the main gallery grid, including lazy loading and infinite scroll.
    - `lightbox.js`: Manages the full-screen lightbox view.
    - `ui.js`: Controls UI elements like the sidebar, theme, and sorting.
    - `favorites.js`: Manages the favorites system using `localStorage`.
- **Rule 5: Keep the context file updated.** After any modification to the project's architecture, dependencies, or conventions, update `GEMINI.md` accordingly.

## 6. Project Features

### Frontend & User Experience

- **Hierarchical Folder Navigation**: Users can navigate through nested folders in the main gallery view, with a "Back" button.
- **Dynamic Masonry Grid**: A responsive grid that intelligently arranges wallpapers based on their aspect ratio (portrait, ultrawide).
- **Performant Image Loading**: Utilizes lazy loading (`IntersectionObserver`), responsive images (`srcset`), and infinite scroll to ensure a fast and smooth user experience, even with large galleries.
- **Advanced Lightbox**: A full-featured lightbox for viewing images with keyboard navigation, image preloading, an explicit close button, and metadata display (name, resolution, format, folder). The mobile view is optimized to ensure controls are always visible, regardless of wallpaper aspect ratio.
    - **Synchronized Image and Metadata Updates**: Wallpaper information now updates simultaneously with the image load, preventing visual stutter.
    - **Smoother Image Transitions**: Implemented a fade-out/fade-in effect for a less jarring experience when changing wallpapers.
    - **Enhanced Preloading**: Preloads multiple adjacent images (2 in each direction) to further reduce perceived loading times during navigation.
- **Category Browsing**: A collapsible sidebar with a hierarchical file tree lets users browse by category.
- **Client-Side Search**: Instantly search and filter wallpapers by name.
- **Advanced Sorting**: Users can sort wallpapers by name, modification date, or resolution.
- **Favorites System**: Users can mark their favorite wallpapers, which are saved locally in the browser.
- **Random Discovery**: A "Random" button to discover new wallpapers easily. The initial view is a random assortment of all available wallpapers. When inside a category, the button will select a random wallpaper from within that category and its subcategories.
- **User-Controlled Theme (Dark/Light Mode)**: The UI features a toggle for users to switch between dedicated light and dark modes. The theme also respects the user's system preference (`prefers-color-scheme`). On each page load, a new random color scheme is generated, and the toggle switches between the light and dark variants of that scheme.
- **Fully Responsive**: The entire interface is optimized for both desktop and mobile devices. Conflicting UI elements are automatically hidden in the lightbox view for a cleaner experience.
- **Accessibility (WCAG 2.2 AA)**:
    - **Semantic Landmarks**: Implemented `<nav>` for primary and sidebar navigation, and `<section>` with `aria-labelledby` for the main gallery content, improving document structure for assistive technologies.
    - **ARIA Attributes**: Added `aria-label` to icon buttons and `role="img"` to SVG icons for better context. `aria-live="polite"` is used on the gallery container to announce dynamic content updates (e.g., search results).
    - **Focus Management**: The lightbox modal now traps keyboard focus, ensuring users cannot tab outside of it while open. Focus is automatically returned to the element that triggered the lightbox upon closing.
    - **Visually Hidden Content**: Utilized a `visually-hidden` CSS class to provide screen reader-only headings for better navigation without affecting visual layout.

### Automation & Deployment

- **Optimized Gallery Generation**: The `generate_gallery.sh` script is highly optimized. It intelligently checks if a wallpaper has already been converted to WebP and is up-to-date, skipping redundant processing. This works in tandem with the Vercel build cache to make subsequent deployments very fast. The `generate_data.mjs` script then creates the necessary metadata for the frontend.
    - **Reduced WebP Quality**: The default WebP quality has been set to `78` for smaller file sizes and faster loading.
    - **Optimized Responsive Image Widths**: The number of generated responsive WebP image widths has been reduced to two (`640w` and `1920w`) to balance build time, storage, and performance.
- **One-Click Deployment**: Pre-configured for seamless deployment to Vercel and Netlify.
- **Static Asset Caching**: Includes `.htaccess` for Apache and `_headers` for Netlify to set long-term `Cache-Control` headers, improving client-side performance.
- **Dynamic Self-Hosting**: A `Dockerfile` and `docker-entrypoint.sh` are provided for easy self-hosting.
    - **Long-term HTTP Caching**: The `docker-entrypoint.sh` now configures `http-server` to set `Cache-Control: max-age=31536000` for all served assets, significantly improving performance for returning users by enabling long-term browser and intermediate cache storage.
- **Vercel Deployment & Caching**:
    - **Build Cache**: The project uses a custom build script (`scripts/vercel_build.sh`) to significantly speed up deployments. It manually caches the generated `public/webp` and `public/lqip` directories within Vercel's persistent cache (`.vercel/cache`). Before a new build starts, it restores these images, and the generation script only processes new or changed wallpapers, saving significant time.
    - **Edge Network (CDN) Caching**: Vercel automatically caches all static assets from the `public` directory on its Edge Network for up to 31 days. It uses a `Cache-Control` header that forces browser revalidation on each request, ensuring users always get the latest content. A new deployment automatically purges the CDN cache.
    - **Dependency Build Script Handling**: To prevent warnings during Vercel deployments related to ignored build scripts (e.g., `@vercel/speed-insights`), the `pnpm install` command in `scripts/vercel_build.sh` now includes the `--ignore-scripts` flag. This ensures that lifecycle scripts are not run during installation, while the necessary build steps are still executed by `pnpm run build`.

### Developer Experience

- **Live Development Server**: `pnpm run dev` provides a live-reloading development server with `esbuild` and `onchange`.
- **Bundle Analysis**: `pnpm run analyze` generates a visualization of the final bundle.
- **GitHub Template**: Designed to be used as a template for easy project scaffolding.
- **Modular Codebase**: The frontend JavaScript is organized into clean, reusable ES modules.
- **Reproducible Environments**: A `flake.nix` file is included for Nix users.
- **Code Quality**: Uses ESLint with `eslint-config-airbnb-base` and `eslint-plugin-prettier`.
- **Automated Formatting**: Pre-commit hooks with Husky and lint-staged automatically format code.
- **Dependency Build Scripts**: The `package.json` is configured with `pnpm.allow-build` to explicitly approve necessary build scripts for dependencies like `@vercel/speed-insights`, preventing warnings in CI/CD environments.
