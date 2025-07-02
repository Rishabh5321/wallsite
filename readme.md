
<div align="center">
  <h1>Wallpaper Gallery</h1>
  <p>A curated collection of stunning wallpapers, ready for one-click deployment.</p>
</div>

---

<center>

[![Netlify Status](https://api.netlify.com/api/v1/badges/050792fd-8efd-43ef-a85f-d841388b7050/deploy-status)](https://app.netlify.com/projects/rishabh5321-wallpapers/deploys)

</center>

## 🚀 Live Gallery

You can view the live wallpaper gallery here: **[Live Gallery](https://rishabh5321.gitlab.io/wallpapers/)**

## Deployment

To deploy your own version of this wallpaper gallery, follow these steps:

1.  **Fork the Repository**
    
    Click the "Fork" button at the top right of this page to create your own copy of this repository.

2.  **Connect to a Deployment Service**
    
    Choose one of the following services and connect your forked repository:
    
    *   **Vercel**: Connect your GitHub account to Vercel, and import your forked repository. Vercel will automatically detect the `vercel.json` file and deploy your site.
    *   **Netlify**: Connect your GitHub account to Netlify, and import your forked repository. Netlify will automatically detect the `netlify.toml` file and deploy your site.

## 🎨 How It Works

This project uses a GitHub Actions workflow to automate the gallery generation process:

1.  **Push to `main`**: When changes are pushed to the `main` branch (e.g., adding a new wallpaper), a workflow is triggered.
2.  **Generate Thumbnails**: The workflow generates smaller thumbnails for each image to ensure the gallery loads quickly.
3.  **Update Gallery**: A shell script (`generate_readme.sh`) runs to scan for all images and injects the list into the `docs/js/gallery-data.js` file.
4.  **Commit Changes**: The updated `gallery-data.js` is automatically committed back to the repository.
5.  **Deployment**: The site is automatically deployed to Vercel and Netlify when changes are pushed to the `main` branch.

## 📥 Adding New Wallpapers

To add a new wallpaper to the gallery, simply:

1.  Add your new image file (e.g., `my-cool-wallpaper.png`) to the `src` directory.
2.  Commit and push the change to the `main` branch of your forked repository.
3.  The GitHub Actions workflow will take care of the rest!

## License

The code in this repository is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. The wallpapers are not covered by this license.
