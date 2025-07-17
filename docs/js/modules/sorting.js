import { dom, state } from './state.js';
import { resetAndLoadGallery } from './gallery.js';

function sortWallpapers(sortBy, wallpapers) {
	const sortedWallpapers = [...wallpapers];

	switch (sortBy) {
		case 'name-asc':
			sortedWallpapers.sort((a, b) => a.name.localeCompare(b.name));
			break;
		case 'name-desc':
			sortedWallpapers.sort((a, b) => b.name.localeCompare(a.name));
			break;
		case 'date-new':
			sortedWallpapers.sort((a, b) => b.mtime - a.mtime);
			break;
		case 'date-old':
			sortedWallpapers.sort((a, b) => a.mtime - b.mtime);
			break;
		case 'res-high':
			sortedWallpapers.sort(
				(a, b) => b.width * b.height - a.width * a.height
			);
			break;
		case 'res-low':
			sortedWallpapers.sort(
				(a, b) => a.width * a.height - b.width * b.height
			);
			break;
		default:
			// 'default' or any other case will not re-sort, maintaining the current order
			break;
	}
	return sortedWallpapers;
}

export function handleSort() {
	const sortBy = dom.sortBy.value;
	state.filteredWallpapers = sortWallpapers(sortBy, state.filteredWallpapers);
	resetAndLoadGallery(false);
}
