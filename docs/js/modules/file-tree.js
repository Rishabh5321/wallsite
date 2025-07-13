import { dom, state } from './state.js';
import { shuffleArray } from './utils.js';
import { resetAndLoadGallery } from './gallery.js';
import { toggleSidebar } from './ui.js';

export function buildFileTree(galleryData) {
    const container = dom.treeContainer;
    if (!container) return;

    const ul = document.createElement('ul');
    ul.className = 'tree-node';

    // Create and handle the "All" folder which represents the root
    const allFolderLi = createTreeElement({
        name: 'All Wallpapers',
        type: 'folder',
        children: galleryData.children,
    });
    allFolderLi.querySelector('.tree-item').classList.add('active');
    ul.appendChild(allFolderLi);
    allFolderLi.querySelector('.tree-item').addEventListener('click', (e) => {
        e.stopPropagation();
        handleTreeSelection(galleryData, allFolderLi.querySelector('.tree-item'));
    });
    // Hide chevron for "All" folder since its content is the root
    const allChevron = allFolderLi.querySelector('.chevron');
    if (allChevron) allChevron.style.display = 'none';

    // Create and handle other top-level folders
    if (galleryData.children) {
        galleryData.children
            .filter((child) => child.type === 'folder')
            .forEach((child) => {
                const li = createTreeElement(child);
                if (li) ul.appendChild(li);
            });
    }
    container.innerHTML = '';
    container.appendChild(ul);
}

function createTreeElement(node) {
    if (node.type !== 'folder') return null;

    const li = document.createElement('li');
    li.className = 'tree-folder';

    const itemDiv = document.createElement('div');
    itemDiv.className = 'tree-item';

    const hasSubfolders =
        node.children && node.children.some((child) => child.type === 'folder');

    const chevronIcon = hasSubfolders
        ? '<svg class="chevron" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6"/></svg>'
        : '';
    const folderIcon =
        '<svg class="icon-folder" viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"></path></svg>';
    const folderOpenIcon =
        '<svg class="icon-folder-open" viewBox="0 0 24 24"><path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"></path></svg>';

    itemDiv.innerHTML = `
        <span class="icon">${folderIcon}${folderOpenIcon}</span>
        <span class="name">${node.name}</span>
    `;
    // Prepend chevron for correct layout
    if (hasSubfolders) {
        itemDiv
            .querySelector('.icon')
            .insertAdjacentHTML('beforebegin', chevronIcon);
    }

    li.appendChild(itemDiv);

    itemDiv.addEventListener('click', (e) => {
        e.stopPropagation();
        handleTreeSelection(node, itemDiv);
        if (hasSubfolders) {
            li.classList.toggle('open');
        }
    });

    if (hasSubfolders) {
        const childrenContainer = document.createElement('div');
        childrenContainer.className = 'tree-children';
        const subUl = document.createElement('ul');
        subUl.className = 'tree-node';
        node.children
            .filter((child) => child.type === 'folder')
            .forEach((child) => {
                const subLi = createTreeElement(child);
                if (subLi) subUl.appendChild(subLi);
            });
        childrenContainer.appendChild(subUl);
        li.appendChild(childrenContainer);
    }
    return li;
}

function handleTreeSelection(node, element) {
    document
        .querySelectorAll('.tree-item.active')
        .forEach((el) => el.classList.remove('active'));
    if (dom.favoritesBtn) dom.favoritesBtn.classList.remove('active');
    element.classList.add('active');

    state.currentDirectory = node;
    state.directoryHistory = [node]; // Reset history to this level
    state.filteredWallpapers = [...(node.children || [])];

    resetAndLoadGallery();

    if (window.innerWidth <= 768) {
        toggleSidebar();
    }
}