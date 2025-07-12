<div align="center">
  <h1>Wallpaper Gallery</h1>
  <p>A curated collection of stunning wallpapers, fully automated and ready for deployment.</p>
</div>

## 📸 Screenshots

<div align="center">
  <img src=".github/screenshot/screenshot1.png" alt="Screenshot 1" width="90%">
  <img src=".github/screenshot/screenshot2.png" alt="Screenshot 2" width="45%">
  <img src=".github/screenshot/screenshot3.png" alt="Screenshot 3" width="45%">
</div>

## ✨ Live Demo

You can view the live wallpaper gallery hosted from this repository here: **[Live Gallery](https://wallsite.vercel.app/)**

---

## 🚀 One-Click Deployment

Deploy your own wallpaper gallery in a single click. This will create a new repository in your GitHub account from a clean template, ready for your wallpapers.

<div align="center">
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FRishabh5321%2Fwallsite-template&repository-name=my-wallpaper-gallery"><img src="https://vercel.com/button" alt="Deploy with Vercel"/></a>
  <a href="https://app.netlify.com/start/deploy?repository=https://github.com/Rishabh5321/wallsite-template"><img src="https://www.netlify.com/img/deploy/button.svg" alt="Deploy to Netlify"></a>
</div>

### How it Works
1. Clicking a deploy button creates a new repository for you from a clean template.
2. It then deploys this new repository to Vercel or Netlify.
3. Once deployed, you can add wallpapers to the `src` folder in your new repository, and your site will automatically update.

---

### 🔧 Advanced Use: Self-hosting with Docker

For users who want to host the gallery on their own server, a pre-built Docker image is available.

<div align="center">
    <a href="docker-compose.yml" title="View docker-compose.yml"><img src="https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/></a>
</div>

1.  **Pull the Docker Image:**
    ```bash
    docker pull ghcr.io/rishabh5321/wallsite:latest
    ```

2.  **Run the Container:**
    Run the Docker container, making sure to mount your local `src` directory (filled with your wallpapers) into the container at `/app/src`.
    ```bash
    docker run -d -p 8000:8000 \
      -v /path/to/your/wallpapers/src:/app/src \
      --name my-wallsite \
      ghcr.io/rishabh5321/wallsite:latest
    ```
    Your gallery will be running at `http://<HOST-IP>:8000`.

## License

The code in this repository is licensed under the MIT License. See the [LICENSE](LICENSE) file for details. Wallpapers are not covered by this license.