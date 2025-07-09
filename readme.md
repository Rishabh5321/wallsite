<div align="center">
  <h1>Wallpaper Gallery</h1>
  <p>A curated collection of stunning wallpapers, ready for one-click deployment.</p>
</div>

## 🚀 One-Click Deployment

Deploy your own wallpaper gallery in a single click using one of the services below:

<div align="center">
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FRishabh5321%2Fwallsite"><img src="https://vercel.com/button" alt="Deploy with Vercel"/></a>
  <a href="https://app.netlify.com/start/deploy?repository=https://github.com/Rishabh5321/wallsite"><img src="https://www.netlify.com/img/deploy/button.svg" alt="Deploy to Netlify"></a>
</div>

## ✅ Status

<div align="center">
<a href="https://rishabh5321-wallpapers.vercel.app/"><img src="https://deploy-badge.vercel.app/vercel/rishabh5321-wallpapers?style=for-the-badge" alt="Vercel Deploy"></img>
<a href="https://rishabh5321-wallpapers.netlify.app/"><img src="http://img.shields.io/netlify/994538a8-0698-462d-a845-e07d778f1229?style=for-the-badge&logo=netlify" alt="Netlify Deploy"></img>
</div>

## 📸 Screenshots

<div align="center">
  <img src=".github/screenshot/screenshot1.png" alt="Screenshot 1" width="90%">
  <img src=".github/screenshot/screenshot2.png" alt="Screenshot 2" width="45%">
  <img src=".github/screenshot/screenshot3.png" alt="Screenshot 3" width="45%">
</div>

## ✨ Live Gallery

You can view the live wallpaper gallery here: **[Live Gallery](https://rishabh5321-wallpapers.vercel.app/)**

## 📥 Adding New Wallpapers

To add a new wallpaper to your gallery:

1.  **Fork the repository** if you haven't already.
2.  Add your new image file (e.g., `my-cool-wallpaper.png`) to the `src` directory of your forked repository.
3.  Commit and push the changes to your `main` branch.
4.  The GitHub Actions workflow will automatically update the gallery and deploy the changes.

## 🎨 How It Works

This project uses a GitHub Actions workflow to automate the gallery generation process:

1.  **Push to `main`**: When changes are pushed to the `main` branch (e.g., adding a new wallpaper), a workflow is triggered.
2.  **Generate Thumbnails**: The workflow generates smaller thumbnails for each image to ensure the gallery loads quickly.
3.  **Update Gallery**: A shell script (`generate_gallery.sh`) runs to scan for all images and injects the list into the `docs/js/gallery-data.js` file.
4.  **Commit Changes**: The updated `gallery-data.js` is automatically committed back to the repository.
5.  **Deployment**: The site is automatically deployed to Vercel and Netlify when changes are pushed to the `main` branch.

## License

The code in this repository is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. The wallpapers are not covered by this license.
