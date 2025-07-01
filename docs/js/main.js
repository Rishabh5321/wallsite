const galleryContainer = document.querySelector(".gallery-container");
const wallpapers = [{full:"../src/wall1.png",thumbnail:"../src/thumbnails/wall1.png"},{full:"../src/wall2.png",thumbnail:"../src/thumbnails/wall2.png"},{full:"../src/wall3.png",thumbnail:"../src/thumbnails/wall3.png"},{full:"../src/wall4.jpg",thumbnail:"../src/thumbnails/wall4.jpg"},{full:"../src/wall5.png",thumbnail:"../src/thumbnails/wall5.png"},{full:"../src/wall6.png",thumbnail:"../src/thumbnails/wall6.png"},{full:"../src/wall7.jpg",thumbnail:"../src/thumbnails/wall7.jpg"},{full:"../src/wall8.png",thumbnail:"../src/thumbnails/wall8.png"},{full:"../src/wall9.jpg",thumbnail:"../src/thumbnails/wall9.jpg"},{full:"../src/wall10.jpg",thumbnail:"../src/thumbnails/wall10.jpg"},{full:"../src/wall11.jpg",thumbnail:"../src/thumbnails/wall11.jpg"},{full:"../src/wall12.jpg",thumbnail:"../src/thumbnails/wall12.jpg"},{full:"../src/wall13.jpg",thumbnail:"../src/thumbnails/wall13.jpg"},{full:"../src/wall14.png",thumbnail:"../src/thumbnails/wall14.png"},{full:"../src/wall15.jpg",thumbnail:"../src/thumbnails/wall15.jpg"},{full:"../src/wall16.jpg",thumbnail:"../src/thumbnails/wall16.jpg"},{full:"../src/wall17.jpg",thumbnail:"../src/thumbnails/wall17.jpg"},{full:"../src/wall18.jpg",thumbnail:"../src/thumbnails/wall18.jpg"},{full:"../src/wall19.jpg",thumbnail:"../src/thumbnails/wall19.jpg"},{full:"../src/wall20.jpg",thumbnail:"../src/thumbnails/wall20.jpg"}];

wallpapers.forEach((wallpaper) => {
    const galleryItem = document.createElement("div");
    galleryItem.classList.add("gallery-item");

    const link = document.createElement("a");
    link.href = wallpaper.full;
    link.target = "_blank";
    link.setAttribute(
        "aria-label",
        `View wallpaper ${wallpaper.full}`,
    );

    const img = document.createElement("img");
    img.src = wallpaper.thumbnail;
    const imageName = wallpaper.full
        .split("/")
        .pop()
        .split(".")
        .slice(0, -1)
        .join(".");
    img.alt = `Wallpaper: ${imageName}`;

    const title = document.createElement("div");
    title.classList.add("wallpaper-title");
    title.textContent = imageName;

    link.appendChild(img);
    galleryItem.appendChild(link);
    galleryItem.appendChild(title);
    galleryContainer.appendChild(galleryItem);
});
