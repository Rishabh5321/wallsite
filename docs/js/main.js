const galleryContainer = document.querySelector(".gallery-container");
const folderContainer = document.querySelector(".folder-container");
const randomWallpaperBtn = document.querySelector("#random-wallpaper-btn");

let lightbox;
let keydownHandler;
let structuredGalleryData;

// Check for the new `galleryData` structure, or fall back to the old `wallpapers` array.
if (typeof galleryData !== 'undefined' && galleryData.length > 0) {
    structuredGalleryData = galleryData;
} else if (typeof wallpapers !== 'undefined' && wallpapers.length > 0) {
    structuredGalleryData = [{ folder: 'Wallpapers', wallpapers: wallpapers }];
} else {
    structuredGalleryData = [];
    console.error("Wallpaper data not found or is empty. Please ensure 'js/gallery-data.js' is loaded correctly.");
}

const allWallpapers = structuredGalleryData.flatMap(folder => 
    folder.wallpapers.map(wp => ({...wp, folder: folder.folder}))
);
let currentWallpapers = [];

function showLightbox(wallpaperList, index) {
    if (!wallpaperList || wallpaperList.length === 0) return;
    const wallpaper = wallpaperList[index];
    const imageName = wallpaper.full.split("/").pop().split(".").slice(0, -1).join(".");

    const loadingContent = `<div class="lightbox-content"><div class="loader"></div></div>`;

    if (lightbox) lightbox.close();

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
        
        const showPrev = () => showLightbox(wallpaperList, (index - 1 + wallpaperList.length) % wallpaperList.length);
        const showNext = () => showLightbox(wallpaperList, (index + 1) % wallpaperList.length);

        lightboxElement.querySelector('.lightbox-prev').onclick = showPrev;
        lightboxElement.querySelector('.lightbox-next').onclick = showNext;

        keydownHandler = (e) => {
            if (e.key === 'ArrowLeft') showPrev();
            else if (e.key === 'ArrowRight') showNext();
            else if (e.key === 'Escape') lightbox.close();
        };
        document.addEventListener('keydown', keydownHandler);

        const nextIndex = (index + 1) % wallpaperList.length;
        const prevIndex = (index - 1 + wallpaperList.length) % wallpaperList.length;
        new Image().src = wallpaperList[nextIndex].full;
        new Image().src = wallpaperList[prevIndex].full;
    };
    img.onerror = () => {
        const lightboxElement = lightbox.element();
        lightboxElement.innerHTML = `<div class="lightbox-content"><p>Error loading image.</p></div>`;
    };
}

function renderGallery(wallpapersToRender) {
    if (!galleryContainer) return;
    galleryContainer.innerHTML = '';
    currentWallpapers = wallpapersToRender;

    // Add a class to the container if there's only one item
    if (currentWallpapers.length === 1) {
        galleryContainer.classList.add('single-item');
    } else {
        galleryContainer.classList.remove('single-item');
    }

    if (currentWallpapers.length === 0) {
        galleryContainer.innerHTML = '<p style="text-align: center; width: 100%;">No wallpapers to display.</p>';
        return;
    }

    currentWallpapers.forEach((wallpaper, index) => {
        const galleryItem = document.createElement("div");
        galleryItem.classList.add("gallery-item");

        const link = document.createElement("a");
        link.href = wallpaper.full;
        link.setAttribute("aria-label", `View wallpaper ${wallpaper.full}`);
        link.addEventListener("click", (e) => {
            e.preventDefault();
            showLightbox(currentWallpapers, index);
        });

        const img = document.createElement("img");
        img.dataset.src = wallpaper.thumbnail;
        img.alt = `Wallpaper: ${wallpaper.full.split("/").pop().split(".").slice(0, -1).join(".")}`;
        img.classList.add('lazy');

        const title = document.createElement("div");
        title.classList.add("wallpaper-title");
        title.textContent = wallpaper.full.split("/").pop().split(".").slice(0, -1).join(".");

        link.appendChild(img);
        galleryItem.appendChild(link);
        galleryItem.appendChild(title);
        galleryContainer.appendChild(galleryItem);
    });

    const lazyImages = Array.from(document.querySelectorAll("img.lazy"));
    if ("IntersectionObserver" in window) {
        const lazyImageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const lazyImage = entry.target;
                    lazyImage.src = lazyImage.dataset.src;
                    lazyImage.classList.remove("lazy");
                    observer.unobserve(lazyImage);
                }
            });
        });
        lazyImages.forEach(lazyImage => lazyImageObserver.observe(lazyImage));
    } else {
        // Fallback for older browsers
        // (omitted for brevity as it was complex and less likely to be the issue)
    }
}

function initializeApp() {
    if (!galleryContainer) {
        console.error("Gallery container not found. Halting initialization.");
        return;
    }

    if (allWallpapers.length === 0) {
        if (folderContainer) folderContainer.style.display = 'none';
        renderGallery([]);
        return;
    }

    if (randomWallpaperBtn) {
        randomWallpaperBtn.addEventListener("click", () => {
            const randomIndex = Math.floor(Math.random() * allWallpapers.length);
            showLightbox(allWallpapers, randomIndex);
        });
    }

    if (folderContainer) {
        folderContainer.innerHTML = '';

        const allBtn = document.createElement('button');
        allBtn.textContent = 'All';
        allBtn.classList.add('folder-btn', 'active');
        allBtn.addEventListener('click', () => {
            renderGallery(allWallpapers);
            document.querySelectorAll('.folder-btn').forEach(btn => btn.classList.remove('active'));
            allBtn.classList.add('active');
        });
        folderContainer.appendChild(allBtn);

        structuredGalleryData.forEach(folder => {
            if (folder.wallpapers.length === 0) return;
            
            const folderBtn = document.createElement('button');
            folderBtn.textContent = folder.folder;
            folderBtn.classList.add('folder-btn');
            folderBtn.addEventListener('click', () => {
                renderGallery(folder.wallpapers);
                document.querySelectorAll('.folder-btn').forEach(btn => btn.classList.remove('active'));
                folderBtn.classList.add('active');
            });
            folderContainer.appendChild(folderBtn);
        });

        if (structuredGalleryData.length <= 1) {
            folderContainer.style.display = 'none';
        }
    }

    renderGallery(allWallpapers);
}

initializeApp();
