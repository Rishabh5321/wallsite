import { dom, state, initializeDom } from './modules/state.js';
import { shuffleArray } from './modules/utils.js';
import { initializeTheme } from './modules/theme.js';
import { loadFavorites } from './modules/favorites.js';
import { buildFileTree } from './modules/file-tree.js';
import { resetAndLoadGallery } from './modules/gallery.js';
import { setupEventListeners } from './modules/events.js';

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

	// If the root has only one folder, and no files, elevate that folder's content to the root.
	if (root.children.length === 1 && root.children[0].type === 'folder') {
		const singleFolder = root.children[0];
		// check if root has any files directly
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

	// Start at the root directory, but display all wallpapers randomly.
	state.currentDirectory = galleryTree;
	state.directoryHistory = [galleryTree];
	state.filteredWallpapers = [...state.allWallpapersList];
	shuffleArray(state.filteredWallpapers);
}

export function initializeApp() {
	initializeDom();
	if (typeof galleryData === 'undefined' || !Array.isArray(galleryData)) {
		console.error(
			"Wallpaper data not found or is in the wrong format. Please ensure 'js/gallery-data.js' is loaded correctly and is an array."
		);
		if (dom.galleryContainer) {
			dom.galleryContainer.innerHTML =
				'<p>Error: Wallpaper data could not be loaded.</p>';
		}
		return;
	}

	const galleryTree = buildGalleryTree(galleryData);

	initializeTheme();
	loadFavorites();
	setupEventListeners();
	initializeState(galleryTree, galleryData);
	buildFileTree(galleryTree);
	resetAndLoadGallery(false); // Pass false to prevent sorting
}
