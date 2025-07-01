const galleryContainer = document.querySelector(".gallery-container");
const wallpapers = [{full:"../src/wall1.png",thumbnail:"../src/thumbnails/wall1.png"},{full:"../src/wall2.png",thumbnail:"../src/thumbnails/wall2.png"},{full:"../src/wall3.png",thumbnail:"../src/thumbnails/wall3.png"},{full:"../src/wall4.jpg",thumbnail:"../src/thumbnails/wall4.jpg"},{full:"../src/wall5.png",thumbnail:"../src/thumbnails/wall5.png"},{full:"../src/wall6.png",thumbnail:"../src/thumbnails/wall6.png"},{full:"../src/wall7.jpg",thumbnail:"../src/thumbnails/wall7.jpg"},{full:"../src/wall8.png",thumbnail:"../src/thumbnails/wall8.png"},{full:"../src/wall9.jpg",thumbnail:"../src/thumbnails/wall9.jpg"},{full:"../src/wall10.jpg",thumbnail:"../src/thumbnails/wall10.jpg"},{full:"../src/wall11.jpg",thumbnail:"../src/thumbnails/wall11.jpg"},{full:"../src/wall12.jpg",thumbnail:"../src/thumbnails/wall12.jpg"},{full:"../src/wall13.jpg",thumbnail:"../src/thumbnails/wall13.jpg"},{full:"../src/wall14.png",thumbnail:"../src/thumbnails/wall14.png"},{full:"../src/wall15.jpg",thumbnail:"../src/thumbnails/wall15.jpg"},{full:"../src/wall16.jpg",thumbnail:"../src/thumbnails/wall16.jpg"},{full:"../src/wall17.jpg",thumbnail:"../src/thumbnails/wall17.jpg"},{full:"../src/wall18.jpg",thumbnail:"../src/thumbnails/wall18.jpg"},{full:"../src/wall19.jpg",thumbnail:"../src/thumbnails/wall19.jpg"},{full:"../src/wall20.jpg",thumbnail:"../src/thumbnails/wall20.jpg"},{full:"../src/wall21.jpg",thumbnail:"../src/thumbnails/wall21.jpg"}];

let lightbox;

function showLightbox(index) {
    const wallpaper = wallpapers[index];
    const imageName = wallpaper.full.split("/").pop().split(".").slice(0, -1).join(".");

    const img = new Image();
    img.src = wallpaper.full;
    img.onload = function () {
        const content = `
            <div class="lightbox-content">
                <img src="${wallpaper.full}" alt="${imageName}">
                <div class="lightbox-details">
                    <div class="wallpaper-info">
                        <span class="wallpaper-name">${imageName}</span>
                        <span class="wallpaper-resolution">${this.width}x${this.height}</span>
                    </div>
                    <a href="${wallpaper.full}" download class="download-btn">Download</a>
                </div>
                <button class="lightbox-prev">&lt;</button>
                <button class="lightbox-next">&gt;</button>
            </div>
        `;

        if (lightbox) {
            lightbox.close();
        }

        lightbox = basicLightbox.create(content, {
            onShow: (instance) => {
                instance.element().querySelector('.lightbox-prev').onclick = () => showLightbox((index - 1 + wallpapers.length) % wallpapers.length);
                instance.element().querySelector('.lightbox-next').onclick = () => showLightbox((index + 1) % wallpapers.length);
            }
        });

        lightbox.show();
    };
}

wallpapers.forEach((wallpaper, index) => {
    const galleryItem = document.createElement("div");
    galleryItem.classList.add("gallery-item");

    const link = document.createElement("a");
    link.href = wallpaper.full;
    link.setAttribute("aria-label", `View wallpaper ${wallpaper.full}`);

    link.addEventListener("click", (e) => {
        e.preventDefault();
        showLightbox(index);
    });

    const img = document.createElement("img");
    img.src = wallpaper.thumbnail;
    const imageName = wallpaper.full.split("/").pop().split(".").slice(0, -1).join(".");
    img.alt = `Wallpaper: ${imageName}`;

    const title = document.createElement("div");
    title.classList.add("wallpaper-title");
    title.textContent = imageName;

    link.appendChild(img);
    galleryItem.appendChild(link);
    galleryItem.appendChild(title);
    galleryContainer.appendChild(galleryItem);
});
