import { dom, state } from './modules/state.js';
import { shuffleArray, flattenTree } from './modules/utils.js';
import { initializeTheme } from './modules/theme.js';
import { loadFavorites } from './modules/favorites.js';
import { buildFileTree } from './modules/file-tree.js';
import { resetAndLoadGallery } from './modules/gallery.js';
import { setupEventListeners } from './modules/events.js';

function initializeState() {
	state.galleryData = galleryData;
	// A flat list of all wallpapers is useful for global search and random
	state.allWallpapersList = flattenTree(galleryData);

	// Start at the root directory, but display all wallpapers randomly.
	state.currentDirectory = galleryData;
	state.directoryHistory = [galleryData];
	state.filteredWallpapers = [...state.allWallpapersList];
	shuffleArray(state.filteredWallpapers);
}

export function initializeApp() {
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

	initializeTheme();
	loadFavorites();
	setupEventListeners();
	initializeState();
	buildFileTree(galleryData);
	resetAndLoadGallery(false); // Pass false to prevent sorting
}
