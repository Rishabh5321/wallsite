import { inject } from '@vercel/analytics';
import { injectSpeedInsights } from '@vercel/speed-insights';
import 'basiclightbox/dist/basicLightbox.min.css';
import '../styles/layout.css';
import '../styles/gallery.css';
import '../styles/lightbox.css';
import { galleryData } from './gallery-data.js';
import { state, initializeDom } from './components/state.js';
import { initializeTheme } from './components/theme.js';
import { loadFavorites } from './components/favorites.js';
import { buildFileTree } from './components/file-tree.js';
import { resetAndLoadGallery } from './components/gallery.js';
import { setupEventListeners } from './components/events.js';
import { initSearch } from './components/search.js';

function buildGalleryTree(files) {
	const root = { type: 'folder', name: 'root', path: '', children: [] };
	const nodeMap = { root };

	files.forEach((file) => {
		const pathParts = file.path.split('/').filter((p) => p);
		let currentNode = root;

		pathParts.forEach((part, index) => {
			const currentPath = pathParts.slice(0, index + 1).join('/');
			let childNode = currentNode.children.find(
				(child) => child.name === part && child.type === 'folder'
			);

			if (!childNode) {
				childNode = {
					type: 'folder',
					name: part,
					path: currentPath,
					children: [],
				};
				currentNode.children.push(childNode);
				nodeMap[currentPath] = childNode;
			}
			currentNode = childNode;
		});

		currentNode.children.push(file);
	});

	if (root.children.length === 1 && root.children[0].type === 'folder') {
		const singleFolder = root.children[0];
		const rootFiles = root.children.filter((c) => c.type === 'file');
		if (rootFiles.length === 0) {
			return singleFolder;
		}
	}

	return root;
}

function initializeState(galleryTree, allWallpapers) {
	state.galleryData = galleryTree;
	state.allWallpapersList = allWallpapers;
	state.currentDirectory = galleryTree;
	state.directoryHistory = [galleryTree];
	// On initial load, display the contents of the root directory.
	state.filteredWallpapers = [...galleryTree.children];
}

export function initializeApp() {
	initializeDom();
	const galleryTree = buildGalleryTree(galleryData);

	initializeTheme();
	loadFavorites();
	setupEventListeners();
	initSearch();
	initializeState(galleryTree, galleryData);
	buildFileTree(galleryTree);
	resetAndLoadGallery(true);
}

inject();
injectSpeedInsights();

document.addEventListener('DOMContentLoaded', initializeApp);
