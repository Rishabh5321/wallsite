import { state, dom } from './state.js';
import { resetAndLoadGallery } from './gallery.js';

export function handleSearch() {
    const searchTerm = dom.searchInput.value.toLowerCase();
    state.filteredWallpapers = state.allWallpapersList.filter((wallpaper) =>
        wallpaper.name.toLowerCase().includes(searchTerm)
    );

    // Deactivate any active tree item since search is a global action
    document
        .querySelectorAll('.tree-item.active')
        .forEach((el) => el.classList.remove('active'));
    if (dom.favoritesBtn) dom.favoritesBtn.classList.remove('active');

    // Clear directory history for search results
    state.directoryHistory = [];

    resetAndLoadGallery(false); // Pass false to prevent sorting
}
