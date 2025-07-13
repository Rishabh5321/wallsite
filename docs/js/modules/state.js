export const dom = {
    galleryContainer: document.querySelector('.gallery-container'),
    treeContainer: document.getElementById('file-manager-tree'),
    sidebar: document.querySelector('.sidebar'),
    sidebarToggle: document.querySelector('.sidebar-toggle'),
    randomWallpaperBtn: document.getElementById('random-wallpaper-btn'),
    searchInput: document.getElementById('search-input'),
    pageIndicator: document.getElementById('page-indicator'),
    favoritesBtn: document.getElementById('favorites-btn'),
};

export const state = {
    lightbox: null,
    keydownHandler: null,
    galleryData: null, // The full tree from gallery-data.js
    currentDirectory: null, // The node of the directory being viewed
    directoryHistory: [], // For back button functionality
    allWallpapersList: [], // A flat list of all wallpapers, used for search
    filteredWallpapers: [], // Holds items (files/folders) of current directory or search results
    favorites: [],
    currentLightboxIndex: 0,
    lightboxWallpaperList: [],
    wallpapersToLoad: 20,
    loadedWallpapersCount: 0,
    isLoadingMore: false,
    intersectionObserver: null,
};