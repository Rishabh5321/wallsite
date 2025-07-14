function handleSort(sortBy, wallpapers) {
	// Separate folders and files to sort files independently
	const files = wallpapers.filter((item) => item.type === 'file');
	const folders = wallpapers.filter((item) => item.type === 'folder');

	switch (sortBy) {
		case 'name-asc':
			files.sort((a, b) => a.name.localeCompare(b.name));
			break;
		case 'name-desc':
			files.sort((a, b) => b.name.localeCompare(a.name));
			break;
		case 'date-new':
			files.sort((a, b) => b.modified - a.modified);
			break;
		case 'date-old':
			files.sort((a, b) => a.modified - b.modified);
			break;
		case 'res-high':
			files.sort((a, b) => {
				const resA = a.resolution.split('x').map(Number);
				const resB = b.resolution.split('x').map(Number);
				return resB[0] * resB[1] - resA[0] * resA[1];
			});
			break;
		case 'res-low':
			files.sort((a, b) => {
				const resA = a.resolution.split('x').map(Number);
				const resB = b.resolution.split('x').map(Number);
				return resA[0] * resA[1] - resB[0] * resB[1];
			});
			break;
		case 'default':
		default:
			// In a directory, sort by name by default
			files.sort((a, b) => a.name.localeCompare(b.name));
			break;
	}

	// Re-combine folders and sorted wallpapers
	return [...folders, ...files];
}

export { handleSort };
