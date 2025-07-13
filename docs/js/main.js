import { dom, state } from './modules/state.js';
import { debounce, shuffleArray, flattenTree } from './modules/utils.js';
import { setRandomTheme, toggleSidebar } from './modules/ui.js';
import { loadFavorites } from './modules/favorites.js';
import { buildFileTree } from './modules/file-tree.js';
import {
    resetAndLoadGallery,
    showRandomWallpaper,
} from './modules/gallery.js';
import { handleSearch } from './modules/search.js';

document.addEventListener('DOMContentLoaded', () => {
    if (typeof galleryData === 'undefined' || !galleryData) {
        console.error(
            "Wallpaper data not found. Please ensure 'js/gallery-data.js' is loaded correctly."
        );
        if (dom.galleryContainer) {
            dom.galleryContainer.innerHTML =
                '<p>Error: Wallpaper data could not be loaded.</p>';
        }
        return;
    }

    initializeApp();
});

function initializeApp() {
    setRandomTheme();
    loadFavorites();
    setupEventListeners();

    state.galleryData = galleryData;
    // A flat list of all wallpapers is useful for global search and random
    state.allWallpapersList = flattenTree(galleryData);

    // Start at the root directory, but display all wallpapers randomly.
    state.currentDirectory = galleryData;
    state.directoryHistory = [galleryData];
    state.filteredWallpapers = [...state.allWallpapersList];
    shuffleArray(state.filteredWallpapers);

    buildFileTree(galleryData);
    resetAndLoadGallery(false); // Pass false to prevent sorting

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
            document
                .querySelectorAll('.tree-item.active')
                .forEach((el) => el.classList.remove('active'));
            dom.favoritesBtn.classList.add('active');

            // Set current view to favorites
            state.directoryHistory = []; // No history for favorites view
            state.filteredWallpapers = [...state.favorites];
            resetAndLoadGallery(false); // Pass false to prevent sorting

            if (window.innerWidth <= 768) {
                toggleSidebar();
            }
        });
    }
}