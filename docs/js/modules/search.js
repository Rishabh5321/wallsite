import { state, dom } from './state.js';
import { resetAndLoadGallery } from './gallery.js';

export function handleSearch() {
    const searchTerm = dom.searchInput.value.toLowerCase();
    // When searching, we should filter from all wallpapers, not the currently filtered list.
    state.filteredWallpapers = state.allWallpapersList.filter((wallpaper) =>
        wallpaper.name.toLowerCase().includes(searchTerm)
    );

    // Also, deactivate any active tree item since search is a global action
    document
        .querySelectorAll('.tree-item.active')
        .forEach((el) => el.classList.remove('active'));
    if (dom.favoritesBtn) dom.favoritesBtn.classList.remove('active');

    resetAndLoadGallery();
}
