import { dom, state } from './modules/state.js';
import { debounce, shuffleArray, flattenTree } from './modules/utils.js';
import { toggleSidebar } from './modules/ui.js';
import { initializeTheme } from './modules/theme.js';
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
    initializeTheme();
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
    if (dom.sortBy) {
        dom.sortBy.addEventListener('change', handleSort);
    }
}

function handleSort() {
    const sortBy = dom.sortBy.value;
    // Separate folders and files to sort files independently
    const wallpapers = state.filteredWallpapers.filter(
        (item) => item.type === 'file'
    );
    const folders = state.filteredWallpapers.filter(
        (item) => item.type === 'folder'
    );

    switch (sortBy) {
        case 'name-asc':
            wallpapers.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'name-desc':
            wallpapers.sort((a, b) => b.name.localeCompare(a.name));
            break;
        case 'date-new':
            wallpapers.sort((a, b) => b.modified - a.modified);
            break;
        case 'date-old':
            wallpapers.sort((a, b) => a.modified - b.modified);
            break;
        case 'res-high':
            wallpapers.sort((a, b) => {
                const resA = a.resolution.split('x').map(Number);
                const resB = b.resolution.split('x').map(Number);
                return resB[0] * resB[1] - (resA[0] * resA[1]);
            });
            break;
        case 'res-low':
            wallpapers.sort((a, b) => {
                const resA = a.resolution.split('x').map(Number);
                const resB = b.resolution.split('x').map(Number);
                return resA[0] * resA[1] - (resB[0] * resB[1]);
            });
            break;
        case 'default':
        default:
            // For default, we don't re-sort the wallpapers themselves,
            // but let the gallery reset logic handle it (e.g. folders first)
            // If the current view is the flat list, we might want to shuffle it.
            if (state.directoryHistory.length <= 1 && dom.searchInput.value === '') {
                 shuffleArray(wallpapers);
            } else {
                // In a directory, sort by name by default
                wallpapers.sort((a, b) => a.name.localeCompare(b.name));
            }
            break;
    }

    // Re-combine folders and sorted wallpapers
    state.filteredWallpapers = [...folders, ...wallpapers];
    // Reset gallery without applying default sorting
    resetAndLoadGallery(false);
}