import { dom, state } from './modules/state.js';
import { debounce, shuffleArray, flattenTree } from './modules/utils.js';
import { setRandomTheme, toggleSidebar, updatePageIndicator } from './modules/ui.js';
import { loadFavorites } from './modules/favorites.js';
import { buildFileTree } from './modules/file-tree.js';
import { loadMoreWallpapers, resetAndLoadGallery, showRandomWallpaper } from './modules/gallery.js';
import { handleSearch } from './modules/search.js';

document.addEventListener('DOMContentLoaded', () => {
    if (typeof galleryData === 'undefined' || !galleryData) {
        console.error("Wallpaper data not found. Please ensure 'js/gallery-data.js' is loaded correctly.");
        if (dom.galleryContainer) {
            dom.galleryContainer.innerHTML = '<p>Error: Wallpaper data could not be loaded.</p>';
        }
        return;
    }

    initializeApp();
});

function initializeApp() {
    setRandomTheme();
    loadFavorites();
    setupEventListeners();

    state.allWallpapersList = flattenTree(galleryData);
    shuffleArray(state.allWallpapersList);

    state.filteredWallpapers = [...state.allWallpapersList];

    buildFileTree(galleryData);

    loadMoreWallpapers();

    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', toggleSidebar);
}

function setupEventListeners() {
    if (dom.sidebarToggle) {
        dom.sidebarToggle.addEventListener('click', toggleSidebar);
    }
    if (dom.randomWallpaperBtn) {
        dom.randomWallpaperBtn.addEventListener('click', showRandomWallpaper);
    }
    if (dom.searchInput) {
        dom.searchInput.addEventListener('input', debounce(handleSearch, 300));
    }
    if (dom.favoritesBtn) {
        dom.favoritesBtn.addEventListener('click', () => {
            document.querySelectorAll('.tree-item.active').forEach((el) => el.classList.remove('active'));
            dom.favoritesBtn.classList.add('active');
            state.filteredWallpapers = [...state.favorites];
            resetAndLoadGallery();
            if (window.innerWidth <= 768) {
                toggleSidebar();
            }
        });
    }
}