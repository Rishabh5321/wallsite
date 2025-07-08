import * as basicLightbox from 'basiclightbox';

document.addEventListener('DOMContentLoaded', () => {
	// --- DOM Elements ---
	const galleryContainer = document.querySelector('.gallery-container');
	const treeContainer = document.getElementById('file-manager-tree');
	const sidebar = document.querySelector('.sidebar');
	const sidebarToggle = document.querySelector('.sidebar-toggle');
	const randomWallpaperBtn = document.getElementById('random-wallpaper-btn');
	const searchInput = document.getElementById('search-input');

	// --- State ---
	let lightbox;
	let keydownHandler;
	let currentWallpapers = [];
	let allWallpapersList = [];
	let currentLightboxIndex = 0;
	let lightboxWallpaperList = []; // Use a dedicated list for the lightbox

	// --- Initialization ---
	if (typeof galleryData === 'undefined' || !galleryData) {
		console.error(
			"Wallpaper data not found. Please ensure 'js/gallery-data.js' is loaded correctly."
		);
		if (galleryContainer)
			galleryContainer.innerHTML =
				'<p>Error: Wallpaper data could not be loaded.</p>';
		return;
	}

	initializeApp();

	// --- Functions ---
	function initializeApp() {
		setRandomTheme();
		setupEventListeners();

		allWallpapersList = flattenTree(galleryData);
		shuffleArray(allWallpapersList); // Shuffle initially
		buildFileTree(galleryData, treeContainer);

		// Initially display all wallpapers
		renderGallery(allWallpapersList);

		// Add an overlay for mobile view to close sidebar
		const overlay = document.createElement('div');
		overlay.className = 'overlay';
		document.body.appendChild(overlay);
		overlay.addEventListener('click', toggleSidebar);
	}

	function setupEventListeners() {
		if (sidebarToggle) {
			sidebarToggle.addEventListener('click', toggleSidebar);
		}
		if (randomWallpaperBtn) {
			randomWallpaperBtn.addEventListener('click', showRandomWallpaper);
		}
		if (searchInput) {
			searchInput.addEventListener('input', handleSearch);
		}
	}

	function toggleSidebar() {
		sidebar.classList.toggle('open');
		sidebarToggle.classList.toggle('open');
	}

	function setRandomTheme() {
		const baseHue = Math.floor(Math.random() * 360);
		const accentColor = `hsl(${baseHue}, 80%, 50%)`;
		const backgroundColorStart = `hsl(${baseHue}, 15%, 8%)`;
		const backgroundColorEnd = `hsl(${(baseHue + 60) % 360}, 15%, 12%)`;

		document.documentElement.style.setProperty(
			'--accent-color',
			accentColor
		);
		document.documentElement.style.setProperty(
			'--primary-button-bg',
			accentColor
		);
		document.documentElement.style.setProperty(
			'--background-start',
			backgroundColorStart
		);
		document.documentElement.style.setProperty(
			'--background-end',
			backgroundColorEnd
		);
	}

	// --- File Tree ---
	function buildFileTree(node, container) {
		const ul = document.createElement('ul');
		ul.className = 'tree-node';

		if (container === treeContainer) {
			const allFolderLi = createTreeElement(
				{ name: 'All', type: 'folder', children: [galleryData] },
				true
			);
			allFolderLi.querySelector('.tree-item').classList.add('active');
			ul.appendChild(allFolderLi);

			allFolderLi
				.querySelector('.tree-item')
				.addEventListener('click', (e) => {
					e.stopPropagation();
					document
						.querySelectorAll('.tree-item.active')
						.forEach((el) => el.classList.remove('active'));
					allFolderLi
						.querySelector('.tree-item')
						.classList.add('active');
					shuffleArray(allWallpapersList); // Shuffle when "All" is clicked
					renderGallery(allWallpapersList);
					if (window.innerWidth <= 768) toggleSidebar();
				});
		}

		if (node.children) {
			node.children
				.filter((child) => child.type === 'folder')
				.forEach((child) => {
					const li = createTreeElement(child, false);
					if (li) ul.appendChild(li);
				});
		}
		container.innerHTML = '';
		container.appendChild(ul);
	}

	function createTreeElement(node, isRoot) {
		if (node.type !== 'folder') return null;

		const li = document.createElement('li');
		li.className = 'tree-folder';

		const itemDiv = document.createElement('div');
		itemDiv.className = 'tree-item';

		const hasSubfolders =
			node.children &&
			node.children.some((child) => child.type === 'folder');

		let chevronIcon = '';
		if (hasSubfolders) {
			chevronIcon =
				'<svg class="chevron" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>';
		}

		const folderIcon =
			'<svg class="icon-folder" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"></path></svg>';
		const folderOpenIcon =
			'<svg class="icon-folder-open" viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"></path></svg>';

		itemDiv.innerHTML = `
            ${chevronIcon}
            <span class="icon">${folderIcon}${folderOpenIcon}</span>
            <span class="name">${node.name}</span>
        `;

		li.appendChild(itemDiv);

		itemDiv.addEventListener('click', (e) => {
			e.stopPropagation();

			if (isRoot) {
				document
					.querySelectorAll('.tree-item.active')
					.forEach((el) => el.classList.remove('active'));
				itemDiv.classList.add('active');
				renderGallery(allWallpapersList);
			} else {
				handleTreeSelection(node, itemDiv);
			}

			if (hasSubfolders) {
				li.classList.toggle('open');
			}
		});

		if (hasSubfolders) {
			const childrenContainer = document.createElement('div');
			childrenContainer.className = 'tree-children';
			buildFileTree(node, childrenContainer);
			li.appendChild(childrenContainer);
		}
		return li;
	}

	function handleTreeSelection(node, element) {
		document
			.querySelectorAll('.tree-item.active')
			.forEach((el) => el.classList.remove('active'));
		element.classList.add('active');

		const wallpapers = flattenTree(node);
		renderGallery(wallpapers);

		if (window.innerWidth <= 768) {
			toggleSidebar();
		}
	}

	function flattenTree(node) {
		let files = [];
		if (node.type === 'file') {
			return [node];
		}
		if (node.children) {
			node.children.forEach((child) => {
				files = files.concat(flattenTree(child));
			});
		}
		return files;
	}

	function shuffleArray(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
	}

	// --- Gallery Rendering ---
	function renderGallery(wallpapersToRender) {
		if (!galleryContainer) return;
		galleryContainer.innerHTML = '';
		currentWallpapers = wallpapersToRender;

		galleryContainer.classList.toggle(
			'single-item',
			currentWallpapers.length === 1
		);

		if (currentWallpapers.length === 0) {
			galleryContainer.innerHTML =
				'<p style="text-align: center; width: 100%;">No wallpapers to display in this category.</p>';
			return;
		}

		currentWallpapers.forEach((wallpaper, index) => {
			const galleryItem = createGalleryItem(wallpaper, index);
			galleryContainer.appendChild(galleryItem);
		});
	}

	function createGalleryItem(wallpaper, index) {
		const galleryItem = document.createElement('div');
		galleryItem.className = 'gallery-item';

		const link = document.createElement('a');
		link.href = wallpaper.full;
		link.setAttribute('aria-label', `View wallpaper ${wallpaper.name}`);
		link.addEventListener('click', (e) => {
			e.preventDefault();
			showLightbox(currentWallpapers, index);
		});

		const img = new Image();
		img.src = wallpaper.thumbnail;
		img.alt = `Wallpaper: ${wallpaper.name}`;
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

		link.appendChild(img);
		galleryItem.appendChild(link);
		galleryItem.appendChild(title);
		return galleryItem;
	}

	// --- Lightbox ---

	function showNextLightboxItem() {
		if (!lightbox || !lightbox.visible()) return;
		currentLightboxIndex =
			(currentLightboxIndex + 1) % lightboxWallpaperList.length;
		updateLightbox(lightboxWallpaperList[currentLightboxIndex]);
	}

	function showPrevLightboxItem() {
		if (!lightbox || !lightbox.visible()) return;
		currentLightboxIndex =
			(currentLightboxIndex - 1 + lightboxWallpaperList.length) %
			lightboxWallpaperList.length;
		updateLightbox(lightboxWallpaperList[currentLightboxIndex]);
	}

	function showLightbox(wallpaperList, index) {
		if (!wallpaperList || wallpaperList.length === 0) return;

		lightboxWallpaperList = wallpaperList;
		currentLightboxIndex = index;
		const wallpaper = lightboxWallpaperList[currentLightboxIndex];

		if (lightbox) {
			if (!lightbox.visible()) {
				lightbox.show();
			}
			updateLightbox(wallpaper);
			return;
		}

		const content = createLightboxContent(wallpaper);
		lightbox = basicLightbox.create(content, {
			onShow: (instance) => {
				const lightboxElement = instance.element();

				const placeholder = lightboxElement.querySelector(
					'.basicLightbox__placeholder'
				);
				const controls = placeholder.querySelectorAll(
					'.lightbox-details, .lightbox-prev, .lightbox-next'
				);
				controls.forEach((control) =>
					lightboxElement.appendChild(control)
				);

				lightboxElement.querySelector('.lightbox-prev').onclick =
					showPrevLightboxItem;
				lightboxElement.querySelector('.lightbox-next').onclick =
					showNextLightboxItem;

				keydownHandler = (e) => {
					if (e.key === 'ArrowLeft') showPrevLightboxItem();
					if (e.key === 'ArrowRight') showNextLightboxItem();
				};
				document.addEventListener('keydown', keydownHandler);
			},
			onClose: () => {
				document.removeEventListener('keydown', keydownHandler);
			},
		});

		lightbox.show(() => {
			updateLightbox(wallpaper);
		});
	}

	function updateLightbox(wallpaper) {
		if (!lightbox) return;

		const lightboxElement = lightbox.element();
		const contentElement =
			lightboxElement.querySelector('.lightbox-content');
		const img = contentElement.querySelector('img');

		contentElement.classList.add('loading');

		const newImg = new Image();
		newImg.src = wallpaper.full;

		newImg.onload = () => {
			img.src = newImg.src;
			img.alt = wallpaper.name.split('.').slice(0, -1).join('.');

			const wallpaperName =
				lightboxElement.querySelector('.wallpaper-name');
			const wallpaperRes = lightboxElement.querySelector(
				'.wallpaper-resolution'
			);
			const downloadBtn = lightboxElement.querySelector('.download-btn');

			wallpaperName.textContent = wallpaper.name
				.split('.')
				.slice(0, -1)
				.join('.');
			wallpaperRes.textContent = `${newImg.naturalWidth}x${newImg.naturalHeight}`;
			downloadBtn.href = wallpaper.full;

			contentElement.classList.remove('loading');

			const nextIndex =
				(currentLightboxIndex + 1) % lightboxWallpaperList.length;
			const prevIndex =
				(currentLightboxIndex - 1 + lightboxWallpaperList.length) %
				lightboxWallpaperList.length;
			if (nextIndex !== currentLightboxIndex)
				new Image().src = lightboxWallpaperList[nextIndex].full;
			if (prevIndex !== currentLightboxIndex)
				new Image().src = lightboxWallpaperList[prevIndex].full;
		};

		newImg.onerror = () => {
			img.alt = 'Error loading image.';
			contentElement.classList.remove('loading');
		};
	}

	function createLightboxContent(wallpaper) {
		const imageName = wallpaper.name.split('.').slice(0, -1).join('.');
		return `
            <div class="lightbox-content">
                <div class="loader"></div>
                <img src="" alt="">
            </div>
            <div class="lightbox-details">
                <div class="wallpaper-info">
                    <span class="wallpaper-name">${imageName}</span>
                    <span class="wallpaper-resolution"></span>
                </div>
                <a href="${wallpaper.full}" download class="download-btn">Download</a>
            </div>
            <button class="lightbox-prev">&lt;</button>
            <button class="lightbox-next">&gt;</button>
        `;
	}

	function showRandomWallpaper() {
		const activeWallpapers =
			currentWallpapers.length > 0
				? currentWallpapers
				: allWallpapersList;
		if (activeWallpapers.length === 0) return;
		const randomIndex = Math.floor(Math.random() * activeWallpapers.length);
		showLightbox(activeWallpapers, randomIndex);
	}

	function handleSearch(event) {
		const searchTerm = event.target.value.toLowerCase();
		const filteredWallpapers = allWallpapersList.filter((wallpaper) =>
			wallpaper.name.toLowerCase().includes(searchTerm)
		);
		renderGallery(filteredWallpapers);
	}
});
