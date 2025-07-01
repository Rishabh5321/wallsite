const galleryContainer = document.querySelector(".gallery-container");
let lightbox;
let keydownHandler;

function showLightbox(index) {
    const wallpaper = wallpapers[index];
    const imageName = wallpaper.full.split("/").pop().split(".").slice(0, -1).join(".");

    const loadingContent = `
        <div class="lightbox-content">
            <div class="loader"></div>
        </div>
    `;

    if (lightbox) {
        lightbox.close();
    }

    lightbox = basicLightbox.create(loadingContent, {
        onClose: () => {
            document.removeEventListener('keydown', keydownHandler);
        }
    });
    lightbox.show();

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
        
        const lightboxElement = lightbox.element();
        lightboxElement.innerHTML = content;
        
        lightboxElement.querySelector('.lightbox-prev').onclick = () => showLightbox((index - 1 + wallpapers.length) % wallpapers.length);
        lightboxElement.querySelector('.lightbox-next').onclick = () => showLightbox((index + 1) % wallpapers.length);

        keydownHandler = (e) => {
            if (e.key === 'ArrowLeft') {
                showLightbox((index - 1 + wallpapers.length) % wallpapers.length);
            } else if (e.key === 'ArrowRight') {
                showLightbox((index + 1) % wallpapers.length);
            } else if (e.key === 'Escape') {
                lightbox.close();
            }
        };
        document.addEventListener('keydown', keydownHandler);

        // Prefetch next and previous images
        const nextIndex = (index + 1) % wallpapers.length;
        const prevIndex = (index - 1 + wallpapers.length) % wallpapers.length;
        new Image().src = wallpapers[nextIndex].full;
        new Image().src = wallpapers[prevIndex].full;
    };
}

function showRandomWallpaper() {
    const randomIndex = Math.floor(Math.random() * wallpapers.length);
    showLightbox(randomIndex);
}

function initializeGallery() {
    const randomWallpaperBtn = document.querySelector("#random-wallpaper-btn");
    randomWallpaperBtn.addEventListener("click", showRandomWallpaper);

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
        img.dataset.src = wallpaper.thumbnail; // Use data-src for lazy loading
        const imageName = wallpaper.full.split("/").pop().split(".").slice(0, -1).join(".");
        img.alt = `Wallpaper: ${imageName}`;
        img.classList.add('lazy');

        const title = document.createElement("div");
        title.classList.add("wallpaper-title");
        title.textContent = imageName;

        link.appendChild(img);
        galleryItem.appendChild(link);
        galleryItem.appendChild(title);
        galleryContainer.appendChild(galleryItem);
    });

    const lazyImages = [].slice.call(document.querySelectorAll("img.lazy"));

    if ("IntersectionObserver" in window) {
        let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    let lazyImage = entry.target;
                    lazyImage.src = lazyImage.dataset.src;
                    lazyImage.classList.remove("lazy");
                    lazyImageObserver.unobserve(lazyImage);
                }
            });
        });

        lazyImages.forEach(function(lazyImage) {
            lazyImageObserver.observe(lazyImage);
        });
    } else {
        // Fallback for older browsers
        let active = false;

        const lazyLoad = function() {
            if (active === false) {
                active = true;

                setTimeout(function() {
                    lazyImages.forEach(function(lazyImage) {
                        if ((lazyImage.getBoundingClientRect().top <= window.innerHeight && lazyImage.getBoundingClientRect().bottom >= 0) && getComputedStyle(lazyImage).display !== "none") {
                            lazyImage.src = lazyImage.dataset.src;
                            lazyImage.classList.remove("lazy");

                            lazyImages = lazyImages.filter(function(image) {
                                return image !== lazyImage;
                            });

                            if (lazyImages.length === 0) {
                                document.removeEventListener("scroll", lazyLoad);
                                window.removeEventListener("resize", lazyLoad);
                                window.removeEventListener("orientationchange", lazyLoad);
                            }
                        }
                    });

                    active = false;
                }, 200);
            }
        };

        document.addEventListener("scroll", lazyLoad);
        window.addEventListener("resize", lazyLoad);
        window.addEventListener("orientationchange", lazyLoad);
    }
}

initializeGallery();

