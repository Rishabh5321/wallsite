import { dom, state } from './state.js';

export function toggleSidebar() {
	if (dom.sidebar) dom.sidebar.classList.toggle('open');
	if (dom.sidebarToggle) dom.sidebarToggle.classList.toggle('open');
}

export function updatePageIndicator() {
	if (!dom.pageIndicator) return;
	const totalPages = Math.ceil(
		state.filteredWallpapers.length / state.wallpapersToLoad
	);
	const currentPage =
		Math.ceil(state.loadedWallpapersCount / state.wallpapersToLoad) || 1;
	if (totalPages > 1) {
		dom.pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;
	} else {
		dom.pageIndicator.textContent = '';
	}
}
