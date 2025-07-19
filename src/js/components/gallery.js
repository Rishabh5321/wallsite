import { dom, state } from './state.js';
import { isFavorite, toggleFavorite } from './favorites.js';
import { showLightbox } from './lightbox.js';
import { updatePageIndicator } from './ui.js';

const lazyLoadObserver = new IntersectionObserver(
	(entries, observer) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				const galleryItem = entry.target;
				const img = galleryItem.querySelector('img');

				if (img && img.dataset.srcset) {
					img.srcset = img.dataset.srcset;
				}
				if (img && img.dataset.src) {
					img.src = img.dataset.src;
				}

				galleryItem.classList.remove('lazy');
				observer.unobserve(galleryItem);
			}
		});
	},
	{
		rootMargin: '0px 0px 200px 0px', // Load images 200px before they enter the viewport
		threshold: 0.01,
	}
);

function getAllFilesFromNode(node) {
	if (node.type === 'file') {
		return [node];
	}
	if (!node.children) {
		return [];
	}
	return node.children.reduce(
		(acc, child) => acc.concat(getAllFilesFromNode(child)),
		[]
	);
}

function getHighestResUrl(srcset) {
	if (!srcset) return null;
	// Simple parser that assumes the last URL in the srcset is the highest resolution
	const sources = srcset.split(',').map((s) => s.trim().split(' '));
	return sources[sources.length - 1][0];
}

function createWallpaperItem(wallpaper) {
	const galleryItem = document.createElement('div');
	galleryItem.className = 'gallery-item lazy'; // Add .lazy class for the observer

	const link = document.createElement('a');
	link.href = encodeURI(wallpaper.full);
	link.setAttribute('aria-label', `View wallpaper ${wallpaper.name}`);
	link.addEventListener('click', (e) => {
		e.preventDefault();
		const wallpapersInView = state.filteredWallpapers.filter(
			(item) => item.type === 'file'
		);
		const wallpaperIndex = wallpapersInView.findIndex(
			(w) => w.full === wallpaper.full
		);
		showLightbox(wallpapersInView, wallpaperIndex);
	});

	// --- Preload on hover ---
	galleryItem.addEventListener('mouseenter', () => {
		const preloadImage = document.getElementById('preload-image');
		if (preloadImage) {
			const highResUrl = getHighestResUrl(wallpaper.srcset);
			if (highResUrl) {
				preloadImage.src = highResUrl;
			} else if (wallpaper.full.toLowerCase().endsWith('.gif')) {
				// Preload the GIF itself
				preloadImage.src = encodeURI(wallpaper.full);
			}
		}
	});

	const picture = document.createElement('picture');
	const img = new Image();

	// The data-srcset contains all the responsive image paths and sizes
	img.dataset.srcset = wallpaper.srcset;
	// The data-src is the smallest image, used as a thumbnail and for initial display
	img.dataset.src = encodeURI(wallpaper.thumbnail);

	img.alt = `Wallpaper: ${wallpaper.name}`;
	img.loading = 'lazy'; // Native lazy loading as a fallback

	// Set sizes attribute to give the browser hints on how the image will be displayed
	img.sizes = '(max-width: 600px) 45vw, (max-width: 1200px) 30vw, 20vw';

	picture.appendChild(img);
	galleryItem.classList.add('loading');

	img.onload = () => {
		const aspectRatio = img.naturalWidth / img.naturalHeight;
		if (aspectRatio < 0.8) galleryItem.classList.add('portrait');
		else if (aspectRatio > 2.0) galleryItem.classList.add('ultrawide');
		galleryItem.classList.remove('loading');
		galleryItem.classList.add('loaded');
	};

	img.onerror = () => {
		galleryItem.innerHTML = '<span>Image failed to load</span>';
		galleryItem.classList.add('error');
		galleryItem.classList.remove('loading');
	};

	const title = document.createElement('div');
	title.className = 'wallpaper-title';
	title.textContent = wallpaper.name.split('.').slice(0, -1).join('.');

	const favoriteBtn = document.createElement('button');
	favoriteBtn.className = 'favorite-btn';
	favoriteBtn.classList.toggle('favorited', isFavorite(wallpaper));
	favoriteBtn.innerHTML =
		'<svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>';
	favoriteBtn.setAttribute('aria-label', 'Add to favorites');
	favoriteBtn.addEventListener('click', (e) => {
		e.stopPropagation();
		e.preventDefault();
		toggleFavorite(wallpaper);
		favoriteBtn.classList.toggle('favorited');
	});

	link.appendChild(picture);
	galleryItem.appendChild(link);
	galleryItem.appendChild(title);
	galleryItem.appendChild(favoriteBtn);
	return galleryItem;
}

function createFolderItem(folder) {
	const folderItem = document.createElement('div');
	folderItem.className = 'gallery-item folder-item';
	folderItem.innerHTML = `
        <div class="folder-icon">
            <svg viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"></path></svg>
        </div>
        <div class="wallpaper-title">${folder.name}</div>
    `;
	folderItem.addEventListener('click', () => {
		state.currentDirectory = folder;
		state.directoryHistory.push(folder);
		state.filteredWallpapers = [...(folder.children || [])];
		resetAndLoadGallery();
	});
	return folderItem;
}

function createBackItem() {
	const backItem = document.createElement('div');
	backItem.className = 'gallery-item folder-item back-item';
	backItem.innerHTML = `
        <div class="folder-icon">
            <svg viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
        </div>
        <div class="wallpaper-title">.. Back</div>
    `;
	backItem.addEventListener('click', () => {
		state.directoryHistory.pop();
		state.currentDirectory =
			state.directoryHistory[state.directoryHistory.length - 1];
		state.filteredWallpapers = [...(state.currentDirectory.children || [])];
		resetAndLoadGallery();
	});
	return backItem;
}

function createGalleryItem(item, index) {
	if (item.type === 'folder') {
		return createFolderItem(item);
	}
	return createWallpaperItem(item, index);
}

function renderGallery(itemsToAppend) {
	if (!dom.galleryContainer) return;

	itemsToAppend.forEach((item) => {
		const galleryItem = createGalleryItem(item);
		dom.galleryContainer.appendChild(galleryItem);
		// Observe the new item if it's a file
		if (item.type === 'file') {
			lazyLoadObserver.observe(galleryItem);
		}
	});
	state.loadedWallpapersCount += itemsToAppend.length;

	dom.galleryContainer.classList.toggle(
		'single-item',
		state.filteredWallpapers.length === 1 &&
			state.filteredWallpapers[0].type === 'file'
	);

	if (state.loadedWallpapersCount >= state.filteredWallpapers.length) {
		if (state.intersectionObserver) {
			state.intersectionObserver.disconnect();
		}
	}
}

export function loadMoreWallpapers() {
	if (
		state.isLoadingMore ||
		state.loadedWallpapersCount >= state.filteredWallpapers.length
	) {
		return;
	}
	state.isLoadingMore = true;

	const itemsToRender = state.filteredWallpapers.slice(
		state.loadedWallpapersCount,
		state.loadedWallpapersCount + state.wallpapersToLoad
	);

	if (itemsToRender.length > 0) {
		renderGallery(itemsToRender);
	} else if (state.loadedWallpapersCount === 0) {
		dom.galleryContainer.innerHTML =
			'<p style="text-align: center; width: 100%;">No items to display.</p>';
	}

	state.isLoadingMore = false;
	updatePageIndicator();
	setupInfiniteScroll();
}

function setupInfiniteScroll() {
	if (state.intersectionObserver) {
		state.intersectionObserver.disconnect();
	}

	state.intersectionObserver = new IntersectionObserver(
		(entries) => {
			if (entries[0].isIntersecting && !state.isLoadingMore) {
				loadMoreWallpapers();
			}
		},
		{ rootMargin: '800px' }
	);

	const lastGalleryItem = dom.galleryContainer.lastElementChild;
	if (lastGalleryItem) {
		state.intersectionObserver.observe(lastGalleryItem);
	} else if (dom.galleryContainer) {
		state.intersectionObserver.observe(dom.galleryContainer);
	}
	updatePageIndicator();
}

export function resetAndLoadGallery(shouldSort = true) {
	if (dom.galleryContainer) dom.galleryContainer.innerHTML = '';
	state.loadedWallpapersCount = 0;
	state.isLoadingMore = false;
	if (state.intersectionObserver) state.intersectionObserver.disconnect();

	// Conditionally sort items: folders first, then files alphabetically
	if (shouldSort) {
		state.filteredWallpapers.sort((a, b) => {
			if (a.type === 'folder' && b.type !== 'folder') return -1;
			if (a.type !== 'folder' && b.type === 'folder') return 1;
			return a.name.localeCompare(b.name);
		});
	}

	// Add a "Back" button if not in the root directory and not in a search/favorites view
	if (state.directoryHistory.length > 1) {
		const backItem = createBackItem();
		dom.galleryContainer.appendChild(backItem);
	}

	loadMoreWallpapers();
}

export function showRandomWallpaper() {
	let wallpaperPool;

	if (state.directoryHistory.length > 1) {
		// User is inside a subdirectory. Get all files recursively from this point.
		wallpaperPool = getAllFilesFromNode(state.currentDirectory);
	} else {
		// User is at the root. This could be the initial view, search, or favorites.
		// In all these cases, the pool should be the files currently being displayed.
		wallpaperPool = state.filteredWallpapers.filter(
			(item) => item.type === 'file'
		);
	}

	// Fallback to all wallpapers if the pool is empty for some reason
	// (e.g., a folder with no files).
	if (wallpaperPool.length === 0) {
		wallpaperPool = state.allWallpapersList;
	}

	if (wallpaperPool.length === 0) return;

	const randomIndex = Math.floor(Math.random() * wallpaperPool.length);
	showLightbox(wallpaperPool, randomIndex);
}
