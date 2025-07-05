const galleryContainer = document.querySelector(".gallery-container");
const folderContainer = document.querySelector(".folder-container");

let lightbox;
let keydownHandler;
let structuredGalleryData;

// Helper function to extract wallpaper name from URL
function getWallpaperName(url) {
    if (!url) return '';
    const fileName = url.split("/").pop();
    return fileName.split(".").slice(0, -1).join(".");
}

function setRandomTheme() {
    const baseHue = Math.floor(Math.random() * 360);
    
    const accentColor = `hsl(${baseHue}, 80%, 50%)`;
    const complementaryColor = `hsl(${(baseHue + 180) % 360}, 15%, 25%)`;
    const backgroundColorStart = `hsl(${baseHue}, 15%, 8%)`;
    const backgroundColorEnd = `hsl(${(baseHue + 60) % 360}, 15%, 12%)`;

    document.documentElement.style.setProperty('--accent-color', accentColor);
    document.documentElement.style.setProperty('--primary-button-bg', accentColor);
    document.documentElement.style.setProperty('--primary-button-text', '#ffffff');
    document.documentElement.style.setProperty('--secondary-button-bg', complementaryColor);
    document.documentElement.style.setProperty('--secondary-button-text', '#e0e0e0');
    document.documentElement.style.setProperty('--background-start', backgroundColorStart);
    document.documentElement.style.setProperty('--background-end', backgroundColorEnd);
}

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

function createLightboxContent(wallpaper, width, height) {
    const imageName = getWallpaperName(wallpaper.full);
    return `
        <div class="lightbox-content">
            <img src="${wallpaper.full}" alt="${imageName}">
            <div class="lightbox-details">
                <div class="wallpaper-info">
                    <span class="wallpaper-name">${imageName}</span>
                    <span class="wallpaper-resolution">${width}x${height}</span>
                </div>
                <a href="${wallpaper.full}" download class="download-btn">Download</a>
            </div>
            <button class="lightbox-prev">&lt;</button>
            <button class="lightbox-next">&gt;</button>
        </div>
    `;
}

function showLightbox(wallpaperList, index) {
    if (!wallpaperList || wallpaperList.length === 0) return;
    const wallpaper = wallpaperList[index];
    
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
        const content = createLightboxContent(wallpaper, this.width, this.height);
        
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

        // Preload next and previous images
        const nextIndex = (index + 1) % wallpaperList.length;
        const prevIndex = (index - 1 + wallpaperList.length) % wallpaperList.length;
        new Image().src = wallpaperList[nextIndex].full;
        new Image().src = wallpaperList[prevIndex].full;
    };
    img.onerror = () => {
        const lightboxElement = lightbox.element();
        lightboxElement.innerHTML = `<div class="lightbox-content"><p style="color: white; text-align: center;">Error loading image.</p></div>`;
    };
}

function renderGallery(wallpapersToRender) {
    if (!galleryContainer) return;
    galleryContainer.innerHTML = '';
    currentWallpapers = wallpapersToRender;

    galleryContainer.classList.toggle('single-item', currentWallpapers.length === 1);

    if (currentWallpapers.length === 0) {
        galleryContainer.innerHTML = '<p style="text-align: center; width: 100%;">No wallpapers to display.</p>';
        return;
    }

    currentWallpapers.forEach((wallpaper, index) => {
        const galleryItem = document.createElement("div");
        galleryItem.classList.add("gallery-item");

        const link = document.createElement("a");
        link.href = wallpaper.full;
        link.setAttribute("aria-label", `View wallpaper ${getWallpaperName(wallpaper.full)}`);
        link.addEventListener("click", (e) => {
            e.preventDefault();
            showLightbox(currentWallpapers, index);
        });

        const img = new Image();
        img.src = wallpaper.thumbnail;
        img.alt = `Wallpaper: ${getWallpaperName(wallpaper.full)}`;
        img.onload = () => {
            const aspectRatio = img.naturalWidth / img.naturalHeight;
            if (aspectRatio < 0.8) { // More portrait-like
                galleryItem.classList.add("portrait");
            } else if (aspectRatio > 2.0) { // More landscape-like
                galleryItem.classList.add("ultrawide");
            }
        };
        img.onerror = () => {
            galleryItem.innerHTML = '<span>Image failed to load</span>';
            galleryItem.classList.add('error');
        };

        const title = document.createElement("div");
        title.classList.add("wallpaper-title");
        title.textContent = getWallpaperName(wallpaper.full);

        link.appendChild(img);
        galleryItem.appendChild(link);
        galleryItem.appendChild(title);
        galleryContainer.appendChild(galleryItem);
    });
}

function initializeApp() {
    setRandomTheme();
    if (!galleryContainer) {
        console.error("Gallery container not found. Halting initialization.");
        return;
    }

    if (allWallpapers.length === 0) {
        if (folderContainer) folderContainer.style.display = 'none';
        renderGallery([]);
        return;
    }

    if (folderContainer) {
        const randomWallpaperBtn = document.createElement('button');
        randomWallpaperBtn.innerHTML = '🎲 Random';
        randomWallpaperBtn.title = 'Show a random wallpaper';
        randomWallpaperBtn.classList.add('folder-btn');
        randomWallpaperBtn.addEventListener("click", () => {
            const activeWallpapers = currentWallpapers.length > 0 ? currentWallpapers : allWallpapers;
            const randomIndex = Math.floor(Math.random() * activeWallpapers.length);
            showLightbox(activeWallpapers, randomIndex);
        });
        folderContainer.appendChild(randomWallpaperBtn);

        if (structuredGalleryData.length > 1) {
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
        }
    }

    renderGallery(allWallpapers);
}

initializeApp();