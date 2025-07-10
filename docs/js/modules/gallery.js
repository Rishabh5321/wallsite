import { dom, state } from './state.js';
import { isFavorite, toggleFavorite } from './favorites.js';
import { showLightbox } from './lightbox.js';
import { updatePageIndicator } from './ui.js';

function renderGallery(wallpapersToAppend) {
    if (!dom.galleryContainer) return;

    wallpapersToAppend.forEach((wallpaper, index) => {
        const galleryItem = createGalleryItem(
            wallpaper,
            state.loadedWallpapersCount + index
        );
        dom.galleryContainer.appendChild(galleryItem);
    });
    state.loadedWallpapersCount += wallpapersToAppend.length;

    dom.galleryContainer.classList.toggle(
        'single-item',
        state.filteredWallpapers.length === 1
    );

    if (state.loadedWallpapersCount >= state.filteredWallpapers.length) {
        if (state.intersectionObserver) {
            state.intersectionObserver.disconnect();
        }
    }
}

export function loadMoreWallpapers() {
    if (
        state.isLoadingMore ||
		state.loadedWallpapersCount >= state.filteredWallpapers.length
    ) {
        return;
    }
    state.isLoadingMore = true;

    const wallpapersToRender = state.filteredWallpapers.slice(
        state.loadedWallpapersCount,
        state.loadedWallpapersCount + state.wallpapersToLoad
    );

    if (wallpapersToRender.length > 0) {
        renderGallery(wallpapersToRender);
    } else if (state.loadedWallpapersCount === 0) {
        dom.galleryContainer.innerHTML =
			'<p style="text-align: center; width: 100%;">No wallpapers found.</p>';
    }

    state.isLoadingMore = false;
    updatePageIndicator();
    setupInfiniteScroll();
}

function setupInfiniteScroll() {
    if (state.intersectionObserver) {
        state.intersectionObserver.disconnect();
    }

    state.intersectionObserver = new IntersectionObserver(
        (entries) => {
            if (entries[0].isIntersecting && !state.isLoadingMore) {
                loadMoreWallpapers();
            }
        },
        { rootMargin: '800px' }
    );

    const lastGalleryItem = dom.galleryContainer.lastElementChild;
    if (lastGalleryItem) {
        state.intersectionObserver.observe(lastGalleryItem);
    } else if (dom.galleryContainer) {
        state.intersectionObserver.observe(dom.galleryContainer);
    }
    updatePageIndicator();
}

export function resetAndLoadGallery() {
    if (dom.galleryContainer) dom.galleryContainer.innerHTML = '';
    state.loadedWallpapersCount = 0;
    state.isLoadingMore = false;
    if (state.intersectionObserver) state.intersectionObserver.disconnect();
    loadMoreWallpapers();
}

function createGalleryItem(wallpaper, index) {
    const galleryItem = document.createElement('div');
    galleryItem.className = 'gallery-item';
    const link = document.createElement('a');
    link.href = encodeURI(wallpaper.full);
    link.setAttribute('aria-label', `View wallpaper ${wallpaper.name}`);
    link.addEventListener('click', (e) => {
        e.preventDefault();
        showLightbox(state.filteredWallpapers, index);
    });

    const img = new Image();
    img.src = encodeURI(wallpaper.thumbnail);
    img.alt = `Wallpaper: ${wallpaper.name}`;
    img.loading = 'lazy';
    galleryItem.classList.add('loading');

    img.onload = () => {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        if (aspectRatio < 0.8) galleryItem.classList.add('portrait');
        else if (aspectRatio > 2.0) galleryItem.classList.add('ultrawide');
        galleryItem.classList.remove('loading');
        galleryItem.classList.add('loaded');
    };

    img.onerror = () => {
        galleryItem.innerHTML = '<span>Image failed to load</span>';
        galleryItem.classList.add('error');
        galleryItem.classList.remove('loading');
    };

    const title = document.createElement('div');
    title.className = 'wallpaper-title';
    title.textContent = wallpaper.name.split('.').slice(0, -1).join('.');

    const favoriteBtn = document.createElement('button');
    favoriteBtn.className = 'favorite-btn';
    favoriteBtn.classList.toggle('favorited', isFavorite(wallpaper));
    favoriteBtn.innerHTML =
		'<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
    favoriteBtn.setAttribute('aria-label', 'Add to favorites');
    favoriteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        toggleFavorite(wallpaper);
        favoriteBtn.classList.toggle('favorited');
    });

    link.appendChild(img);
    galleryItem.appendChild(link);
    galleryItem.appendChild(title);
    galleryItem.appendChild(favoriteBtn);
    return galleryItem;
}

export function showRandomWallpaper() {
    const activeWallpapers =
		state.filteredWallpapers.length > 0
		    ? state.filteredWallpapers
		    : state.allWallpapersList;
    if (activeWallpapers.length === 0) return;
    const randomIndex = Math.floor(Math.random() * activeWallpapers.length);
    showLightbox(activeWallpapers, randomIndex);
}
