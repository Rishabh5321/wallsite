import { state } from './state.js';

export function loadFavorites() {
    const storedFavorites = localStorage.getItem('wallpaperFavorites');
    if (storedFavorites) {
        try {
            state.favorites = JSON.parse(storedFavorites);
        } catch (e) {
            console.error('Error parsing favorites from localStorage', e);
            state.favorites = [];
        }
    }
}

function saveFavorites() {
    localStorage.setItem('wallpaperFavorites', JSON.stringify(state.favorites));
}

export function isFavorite(wallpaper) {
    if (!wallpaper) return false;
    return state.favorites.some((fav) => fav.full === wallpaper.full);
}

export function toggleFavorite(wallpaper) {
    if (!wallpaper) return;
    const index = state.favorites.findIndex(
        (fav) => fav.full === wallpaper.full
    );
    if (index > -1) {
        state.favorites.splice(index, 1);
    } else {
        state.favorites.push(wallpaper);
    }
    saveFavorites();
}
