import { state } from './state.js';
import { resetAndLoadGallery } from './gallery.js';

function debounce(func, delay) {
	let timeout;
	return (...args) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func.apply(this, args), delay);
	};
}

function filterWallpapers(query) {
	const lowerCaseQuery = query.toLowerCase().trim();

	if (!lowerCaseQuery) {
		// If search is cleared, restore the view to the current directory's contents
		state.filteredWallpapers = [...(state.currentDirectory.children || [])];
		resetAndLoadGallery(true); // Restore with default sorting
		return;
	}

	const filtered = state.allWallpapersList.filter((wallpaper) => {
		if (wallpaper.type !== 'file') return false; // Only search files

		const nameMatch = wallpaper.name.toLowerCase().includes(lowerCaseQuery);
		const tagMatch = wallpaper.path.toLowerCase().includes(lowerCaseQuery);
		const colorMatch =
			wallpaper.colorName &&
			wallpaper.colorName.toLowerCase().includes(lowerCaseQuery);

		return nameMatch || tagMatch || colorMatch;
	});

	state.filteredWallpapers = filtered;
	resetAndLoadGallery(false); // Render search results without sorting
}

export function initSearch() {
	const searchInput = document.getElementById('search-input');
	if (searchInput) {
		searchInput.addEventListener(
			'input',
			debounce((e) => {
				filterWallpapers(e.target.value);
			}, 300)
		);
	}
}
