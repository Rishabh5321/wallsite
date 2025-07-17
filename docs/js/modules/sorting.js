import { dom, state } from './state.js';
import { resetAndLoadGallery } from './gallery.js';

function sortWallpapers(sortBy, wallpapers) {
	const sortedWallpapers = [...wallpapers];

	// Primary sort: always put folders first
	sortedWallpapers.sort((a, b) => {
		if (a.type === 'folder' && b.type !== 'folder') return -1;
		if (a.type !== 'folder' && b.type === 'folder') return 1;

		// Secondary sort: based on user's selection
		switch (sortBy) {
			case 'name-asc':
				return a.name.localeCompare(b.name);
			case 'name-desc':
				return b.name.localeCompare(a.name);
			case 'date-new':
				// Files have mtime, folders do not. Sort folders by name in this case.
				if (!a.mtime || !b.mtime) return a.name.localeCompare(b.name);
				return b.mtime - a.mtime;
			case 'date-old':
				if (!a.mtime || !b.mtime) return a.name.localeCompare(b.name);
				return a.mtime - b.mtime;
			case 'res-high':
				// Files have resolution, folders do not. Sort folders by name.
				if (!a.width || !b.width) return a.name.localeCompare(b.name);
				return b.width * b.height - a.width * a.height;
			case 'res-low':
				if (!a.width || !b.width) return a.name.localeCompare(b.name);
				return a.width * a.height - b.width * b.height;
			default:
				return 0; // Keep original order if 'default' or unknown
		}
	});

	return sortedWallpapers;
}

export function handleSort() {
	const sortBy = dom.sortBy.value;
	state.filteredWallpapers = sortWallpapers(sortBy, state.filteredWallpapers);
	resetAndLoadGallery(false);
}
