export const dom = {
	galleryContainer: null,
	treeContainer: null,
	sidebar: null,
	sidebarToggle: null,
	randomWallpaperBtn: null,
	searchInput: null,
	pageIndicator: null,
	favoritesBtn: null,
	themeToggle: null,
	sortBy: null,
};

export function initializeDom() {
	dom.galleryContainer = document.querySelector('.gallery-container');
	dom.treeContainer = document.getElementById('file-manager-tree');
	dom.sidebar = document.querySelector('.sidebar');
	dom.sidebarToggle = document.querySelector('.sidebar-toggle');
	dom.randomWallpaperBtn = document.getElementById('random-wallpaper-btn');
	dom.searchInput = document.getElementById('search-input');
	dom.pageIndicator = document.getElementById('page-indicator');
	dom.favoritesBtn = document.getElementById('favorites-btn');
	dom.themeToggle = document.getElementById('theme-toggle');
	dom.sortBy = document.getElementById('sort-by');
}

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
	themeBaseHue: null,
};
