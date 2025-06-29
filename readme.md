# 🖼️ Wallpaper Gallery

This repository hosts a curated collection of beautiful wallpapers. The gallery is automatically updated when new wallpapers are added to the `src` directory.

## 🚀 Live Gallery

You can view the live wallpaper gallery here: **[Live Gallery](https://rishabh5321.gitlab.io/wallpapers/)**

*(Note: The live gallery is hosted on GitLab Pages and is updated automatically after every change to the `main` branch.)*

## 🎨 How It Works

This project uses a GitHub Actions workflow to automate the gallery generation process:

1.  **Push to `main`**: When changes are pushed to the `main` branch (e.g., adding a new wallpaper), a workflow is triggered.
2.  **Generate Thumbnails**: The workflow generates smaller thumbnails for each image to ensure the gallery loads quickly.
3.  **Update Gallery**: A shell script (`generate_readme.sh`) runs to scan for all images and injects the list into the `index.html` file.
4.  **Commit Changes**: The updated `index.html` is automatically committed back to the repository.
5.  **Sync to GitLab**: The repository is mirrored to GitLab, where GitLab Pages is used to host the `index.html` file as a live website.

## Why GitLab Pages?

We prefer using GitLab Pages over GitHub Pages because GitHub Pages has a limitation of one `github.io` domain per user, while GitLab Pages does not have this restriction, allowing for multiple project websites.

## Syncing to GitLab

To sync this repository to your own GitLab account and set up a live gallery, follow these steps:

1.  **Create a GitLab Account**: If you don't have one already, sign up for a free account at [gitlab.com](https://gitlab.com).
2.  **Create a New Project**: Create a new, blank project on GitLab. Do not initialize it with a `README.md` file.
3.  **Clone from GitHub**: Use the "Import project" option and select "Repo by URL." Enter the clone URL of this GitHub repository.
4.  **Configure CI/CD**: In your new GitLab project, go to **Settings > CI/CD** and set up GitLab Pages.

## `sync-to-gitlab` Workflow

The `.github/workflows/update-gallery.yml` file includes a `sync-to-gitlab` job that automatically mirrors the repository to GitLab after the gallery is updated. To set this up, you need to configure the following secrets in your GitHub repository's settings (**Settings > Secrets and variables > Actions**):

*   `GITLAB_URL`: The URL of your GitLab repository (e.g., `https://gitlab.com/your-username/your-repo.git`).
*   `USERNAME`: Your GitLab username.
*   `GITLAB_PAT`: A GitLab Personal Access Token with `write_repository` permissions.

## 📥 Adding New Wallpapers

To add a new wallpaper to the gallery, simply:

1.  Add your new image file (e.g., `my-cool-wallpaper.png`) to the `src` directory.
2.  Commit and push the change to the `main` branch.
3.  The GitHub Actions workflow will take care of the rest!

## License

The code in this repository is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. The wallpapers are not covered by this license.
