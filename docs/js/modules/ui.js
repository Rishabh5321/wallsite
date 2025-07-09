import { dom, state } from './state.js';

export function toggleSidebar() {
    if (dom.sidebar) dom.sidebar.classList.toggle('open');
    if (dom.sidebarToggle) dom.sidebarToggle.classList.toggle('open');
}

export function setRandomTheme() {
    const baseHue = Math.floor(Math.random() * 360);
    const accentColor = `hsl(${baseHue}, 80%, 50%)`;
    const backgroundColorStart = `hsl(${baseHue}, 15%, 8%)`;
    const backgroundColorEnd = `hsl(${(baseHue + 60) % 360}, 15%, 12%)`;

    document.documentElement.style.setProperty('--accent-color', accentColor);
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
