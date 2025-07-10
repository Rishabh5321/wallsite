import * as basicLightbox from 'basiclightbox';
import { state } from './state.js';
import { isFavorite, toggleFavorite } from './favorites.js';

function showNextLightboxItem() {
    if (!state.lightbox || !state.lightbox.visible()) return;
    state.currentLightboxIndex =
		(state.currentLightboxIndex + 1) % state.lightboxWallpaperList.length;
    updateLightbox(state.lightboxWallpaperList[state.currentLightboxIndex]);
}

function showPrevLightboxItem() {
    if (!state.lightbox || !state.lightbox.visible()) return;
    state.currentLightboxIndex =
		(state.currentLightboxIndex - 1 + state.lightboxWallpaperList.length) %
		state.lightboxWallpaperList.length;
    updateLightbox(state.lightboxWallpaperList[state.currentLightboxIndex]);
}

export function showLightbox(wallpaperList, index) {
    if (!wallpaperList || wallpaperList.length === 0) return;

    state.lightboxWallpaperList = wallpaperList;
    state.currentLightboxIndex = index;
    const wallpaper = state.lightboxWallpaperList[state.currentLightboxIndex];

    if (state.lightbox) {
        if (!state.lightbox.visible()) {
            state.lightbox.show();
        }
        updateLightbox(wallpaper);
        return;
    }

    const content = createLightboxContent(wallpaper);
    state.lightbox = basicLightbox.create(content, {
        onShow: (instance) => {
            const lightboxElement = instance.element();
            const placeholder = lightboxElement.querySelector(
                '.basicLightbox__placeholder'
            );
            // Move navigation controls and lightbox-details out of the placeholder
            const navControls = placeholder.querySelectorAll(
                '.lightbox-prev, .lightbox-next'
            );
            navControls.forEach((control) =>
                lightboxElement.appendChild(control)
            );

            const lightboxDetails =
				placeholder.querySelector('.lightbox-details');
            if (lightboxDetails) {
                lightboxElement.appendChild(lightboxDetails);
            }

            lightboxElement.querySelector('.lightbox-prev').onclick =
				showPrevLightboxItem;
            lightboxElement.querySelector('.lightbox-next').onclick =
				showNextLightboxItem;

            state.keydownHandler = (e) => {
                if (e.key === 'ArrowLeft') showPrevLightboxItem();
                if (e.key === 'ArrowRight') showNextLightboxItem();
            };
            document.addEventListener('keydown', state.keydownHandler);
        },
        onClose: () => {
            document.removeEventListener('keydown', state.keydownHandler);
        },
    });

    state.lightbox.show(() => {
        updateLightbox(wallpaper);
    });
}

function updateLightbox(wallpaper) {
    if (!state.lightbox || !wallpaper) return;

    const lightboxElement = state.lightbox.element();
    const contentElement = lightboxElement.querySelector('.lightbox-content');
    const img = contentElement.querySelector('img');
    const wallpaperName = lightboxElement.querySelector('.wallpaper-name');
    const wallpaperRes = lightboxElement.querySelector('.wallpaper-resolution');
    const wallpaperFormat = lightboxElement.querySelector('.wallpaper-format');
    const wallpaperFolder = lightboxElement.querySelector('.wallpaper-folder');
    const downloadBtn = lightboxElement.querySelector('.download-btn');
    const favoriteBtn = lightboxElement.querySelector('.lightbox-favorite-btn');

    contentElement.classList.add('loading');

    img.src = encodeURI(wallpaper.thumbnail);
    img.alt = `Thumbnail for ${wallpaper.name}`;
    const currentThumbnail = wallpaper.thumbnail;

    wallpaperName.textContent = wallpaper.name
        .split('.')
        .slice(0, -1)
        .join('.');
    wallpaperRes.textContent = 'Loading full resolution...';

    // Extract format
    const format = wallpaper.name.split('.').pop().toUpperCase();
    wallpaperFormat.textContent = `Format: ${format}`;

    // Extract folder
    wallpaperFolder.textContent = `Folder: ${wallpaper.path}`;

    downloadBtn.href = encodeURI(wallpaper.full);

    favoriteBtn.classList.toggle('favorited', isFavorite(wallpaper));
    favoriteBtn.onclick = () => {
        toggleFavorite(wallpaper);
        favoriteBtn.classList.toggle('favorited');
    };

    const fullImage = new Image();
    console.log('Attempting to load full image from:', encodeURI(wallpaper.full));
    fullImage.src = encodeURI(wallpaper.full);

    fullImage.onload = () => {
        console.log('Full image loaded successfully. Setting img.src to:', fullImage.src);
        img.src = fullImage.src;
        img.alt = wallpaper.name.split('.').slice(0, -1).join('.');
        contentElement.classList.remove('loading');
        wallpaperRes.textContent = `${fullImage.naturalWidth}x${fullImage.naturalHeight}`;

        const nextIndex =
			(state.currentLightboxIndex + 1) %
			state.lightboxWallpaperList.length;
        const prevIndex =
			(state.currentLightboxIndex -
				1 +
				state.lightboxWallpaperList.length) %
			state.lightboxWallpaperList.length;
        if (nextIndex !== state.currentLightboxIndex)
            new Image().src = encodeURI(
                state.lightboxWallpaperList[nextIndex].full
            );
        if (prevIndex !== state.currentLightboxIndex)
            new Image().src = encodeURI(
                state.lightboxWallpaperList[prevIndex].full
            );
    };

    fullImage.onerror = () => {
        console.error(
            'Lightbox: Full image failed to load for',
            wallpaper.name,
            'URL:',
            encodeURI(wallpaper.full)
        );
        contentElement.classList.remove('loading');
        wallpaperRes.textContent = 'Full image failed to load.';
    };
}

function createLightboxContent(wallpaper) {
    const imageName = wallpaper.name.split('.').slice(0, -1).join('.');
    const encodedFullUrl = encodeURI(wallpaper.full);

    return `
        <div class="lightbox-main-wrapper">
            <div class="lightbox-content">
                <div class="loader"></div>
                <img src="" alt="">
            </div>
            <div class="lightbox-details">
                <div class="wallpaper-info">
                    <span class="wallpaper-name">${imageName}</span>
                    <span class="wallpaper-resolution"></span>
                    <span class="wallpaper-format"></span>
                    <span class="wallpaper-folder"></span>
                </div>
                <div class="lightbox-actions">
                    <button class="lightbox-favorite-btn" aria-label="Toggle Favorite">
                        <svg class="icon" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                    </button>
                    <a href="${encodedFullUrl}" download class="download-btn">Download</a>
                </div>
            </div>
        </div>
        <button class="lightbox-prev" aria-label="Previous">&lt;</button>
        <button class="lightbox-next" aria-label="Next">&gt;</button>
    `;
}
