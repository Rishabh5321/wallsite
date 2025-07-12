# Gemini Project Configuration: wallsite

This file provides context for the AI assistant to understand the architecture and conventions of the `wallsite` project.

## 1. Project Overview

This is a self-hostable wallpaper gallery project. Its primary goal is to be distributed as a user-friendly GitHub template, allowing others to easily create and deploy their own galleries. The project supports two main deployment methods: a simple Git-based deployment via Vercel/Netlify and an advanced self-hosted deployment via a pre-built Docker image.

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

## 4. Development Rules & Conventions

-   **Rule 1: Never edit generated files directly.** The `docs/js/gallery-data.js` file and the contents of the `src/thumbnails` directory are generated artifacts. To update them, run the `./scripts/generate_gallery.sh` script.
-   **Rule 2: The template repository is sacred.** Do not make manual changes to the `wallsite-template` repository. All changes must be made in the main `wallsite` repository and will be synced automatically.
-   **Rule 3: The user experience is paramount.** The main `README.md` acts as a "launchpad" directing users to the template. The template's `README.md` provides the actual deployment steps for the user.
