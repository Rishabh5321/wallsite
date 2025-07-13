# Gemini Project Configuration: wallsite

This file provides context for the AI assistant to understand the architecture and conventions of the `wallsite` project.

## 1. Project Overview

This is a self-hostable wallpaper gallery project. Its primary goal is to be distributed as a user-friendly GitHub template, allowing others to easily create and deploy their own galleries. The project supports two main deployment methods: a simple Git-based deployment via Vercel/Netlify and an advanced self-hosted deployment via Docker.

## 2. Core Technologies

-   **Frontend:** Vanilla JavaScript (ESM), HTML, CSS.
-   **Build Tool:** `esbuild` is used for bundling assets.
-   **Package Manager:** `pnpm`.
-   **Image Processing:** `ImageMagick` is a required dependency for thumbnail generation.
-   **Automation:** GitHub Actions are critical for all automation.
-   **Containerization:** Docker is used for the self-hosting option.

## 3. Key Architectural Concepts

### The Two-Repository System

This project uses two separate repositories to function correctly:

1.  **`wallsite` (This Repository):**
    -   This is the **main development repository** and serves as the **live demo**.
    -   It contains the developer's own wallpapers in the `/src` folder.
    -   It contains all workflows, including the one to publish the Docker image (`publish-docker.yml`) and the one to sync to the template (`sync-template.yml`).

2.  **`wallsite-template` (The User-Facing Template):**
    -   This is the repository that users generate from.
    -   It is **automatically kept in sync** with `wallsite` by the `sync-template.yml` workflow.
    -   **Crucially, its `/src` folder is kept empty** (containing only a placeholder `README.md`).
    -   Its `README.md` is different from the main one and contains deployment instructions for the user.
    -   It only contains the `update-gallery.yml` workflow, as the others are excluded by the sync process.

### Core Automation Workflows

-   **`update-gallery.yml`:** This is the essential workflow for the end-user. It watches for changes in the `/src` directory and runs the `generate_gallery.sh` script to update the gallery data and thumbnails.
-   **`sync-template.yml`:** This workflow runs in the main `wallsite` repo. It copies all relevant files (excluding `/src` and specific developer workflows) to the `wallsite-template` repo to keep it up-to-date.
-   **`publish-docker.yml`:** This workflow runs in the main `wallsite` repo to build and publish the Docker image to the GitHub Container Registry (GHCR).

### Dynamic Docker Deployment

The Docker setup is designed for maximum flexibility. It uses a single-stage `Dockerfile` with a custom `docker-entrypoint.sh` script. This architecture ensures that when a user runs the container with their own wallpaper directory mounted to `/app/src`, the gallery is generated **at runtime**. This means any changes to the user's local wallpaper folder are reflected on the next container start, without needing to rebuild the Docker image itself.

## 4. Development Rules & Conventions

-   **Rule 1: Never edit generated files directly.** The `docs/js/gallery-data.js` file and the contents of the `src/thumbnails` directory are generated artifacts. To update them, run the `./scripts/generate_gallery.sh` script.
-   **Rule 2: The template repository is sacred.** Do not make manual changes to the `wallsite-template` repository. All changes must be made in the main `wallsite` repository and will be synced automatically.
-   **Rule 3: The user experience is paramount.** The main `README.md` acts as a "launchpad" directing users to the template. The template's `README.md` provides the actual deployment steps for the user.

## 5. Project Features

### Frontend & User Experience
-   **Hierarchical Folder Navigation**: Users can navigate through nested folders directly in the main gallery view, with a "Back" button for easy traversal.
-   **Dynamic Masonry Grid**: A responsive grid that intelligently arranges wallpapers based on their aspect ratio (portrait, ultrawide).
-   **Performant Image Loading**: Utilizes lazy loading and infinite scroll to ensure a fast and smooth user experience, even with large galleries.
-   **Advanced Lightbox**: A full-featured lightbox for viewing images with keyboard navigation, image preloading, an explicit close button, and metadata display (name, resolution, format, folder). The mobile view is optimized to ensure controls are always visible, regardless of wallpaper aspect ratio.
-   **Category Browsing**: A collapsible sidebar with a hierarchical file tree lets users browse wallpapers by category.
-   **Client-Side Search**: Instantly search and filter wallpapers by name.
-   **Advanced Sorting**: Users can sort wallpapers by name, modification date, or resolution.
-   **Favorites System**: Users can mark their favorite wallpapers, which are saved locally in the browser.
-   **Random Discovery**: A "Random" button to discover new wallpapers easily. The initial view is a random assortment of all available wallpapers.
-   **User-Controlled Theme (Dark/Light Mode)**: The UI features a toggle for users to switch between dedicated light and dark modes. The theme also respects the user's system preference (`prefers-color-scheme`). On each page load, a new random color scheme is generated, and the toggle switches between the light and dark variants of that scheme.
-   **Fully Responsive**: The entire interface is optimized for both desktop and mobile devices. Conflicting UI elements are automatically hidden in the lightbox view for a cleaner experience.

### Automation & Deployment
-   **Automatic Gallery Generation**: A highly optimized, parallelized shell script (`generate_gallery.sh`) uses ImageMagick to automatically generate thumbnails and a JSON-like data file for the frontend at high speed.
-   **GitHub Actions Integration**: The `update-gallery.yml` workflow automatically runs the generation script whenever images in the `src` directory are updated.
-   **One-Click Deployment**: Pre-configured for seamless deployment to Vercel and Netlify.
-   **Dynamic Self-Hosting**: A `Dockerfile` and `docker-entrypoint.sh` are provided for easy self-hosting. The container generates all gallery content on startup based on a mounted volume, allowing for dynamic wallpaper management without rebuilding the image.

### Developer Experience
-   **Live Development Server**: A `dev` script (`pnpm run dev`) provides a live-reloading development server powered by `esbuild` for a fast and efficient workflow.
-   **GitHub Template**: Designed to be used as a template, allowing for easy project scaffolding.
-   **Modular Codebase**: The frontend JavaScript is organized into clean, reusable ES modules.
-   **Reproducible Environments**: A `flake.nix` file is included for setting up a consistent development environment using Nix.
-   **Code Quality**: Pre-configured with ESLint and Prettier for maintaining code standards.