import { dom, state } from './state.js';
import { toggleSidebar } from './ui.js';
import { showRandomWallpaper, resetAndLoadGallery } from './gallery.js';
import { handleSort } from './sorting.js';

function setupCoreEventListeners() {
	if (dom.sidebarToggle) {
		dom.sidebarToggle.addEventListener('click', toggleSidebar);
	}
	if (dom.randomWallpaperBtn) {
		dom.randomWallpaperBtn.addEventListener('click', showRandomWallpaper);
	}
	if (dom.sortBy) {
		dom.sortBy.addEventListener('change', handleSort);
	}
}

function setupFavoritesEventListener() {
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

function setupOverlayEventListener() {
	const overlay = document.createElement('div');
	overlay.className = 'overlay';
	document.body.appendChild(overlay);
	overlay.addEventListener('click', toggleSidebar);
}

export function setupEventListeners() {
	setupCoreEventListeners();
	setupFavoritesEventListener();
	setupOverlayEventListener();
}
