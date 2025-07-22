import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import 'basiclightbox/dist/basicLightbox.min.css';
import '../styles/layout.css';
import '../styles/gallery.css';
import '../styles/lightbox.css';
import { state, initializeDom } from './components/state.js';
import { initializeTheme } from './components/theme.js';
import { loadFavorites } from './components/favorites.js';
import { buildFileTree } from './components/file-tree.js';
import { resetAndLoadGallery } from './components/gallery.js';
import { setupEventListeners } from './components/events.js';
import { initSearch } from './components/search.js';

function initializeState(galleryTree, allWallpapers) {
	state.galleryData = galleryTree;
	state.allWallpapersList = allWallpapers;
	state.currentDirectory = galleryTree;
	state.directoryHistory = [galleryTree];
	// On initial load, display the contents of the root directory.
	state.filteredWallpapers = [...galleryTree.children];
}

function startApp(galleryData, galleryTree) {
	initializeDom();

	initializeTheme();
	loadFavorites();
	setupEventListeners();
	initSearch();
	initializeState(galleryTree, galleryData);
	buildFileTree(galleryTree);
	resetAndLoadGallery(true);
}

async function initializeApp() {
	try {
		const response = await fetch('/gallery-data.json');
		const { galleryData, galleryTree } = await response.json();
		startApp(galleryData, galleryTree);
	} catch (error) {
		console.error('Error loading gallery data:', error);
	}
}

inject();
injectSpeedInsights();

document.addEventListener('DOMContentLoaded', initializeApp);
