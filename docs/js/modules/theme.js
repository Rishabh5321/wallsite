import { dom, state } from './state.js';

const sunIcon = `<svg class="icon icon-sun" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm-1-11h2v2h-2zm-2.12 4.46l1.41 1.41 1.41-1.41-1.41-1.41zm5.65 0l1.41 1.41 1.41-1.41-1.41-1.41zM11 17h2v2h-2zm-5.46-2.12l1.41 1.41 1.41-1.41-1.41-1.41zm10.92 0l1.41 1.41 1.41-1.41-1.41-1.41z"/></svg>`;
const moonIcon = `<svg class="icon icon-moon" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.06-7.44 7-7.93v15.86z"/></svg>`;

function applyThemeColors(theme) {
    const baseHue = state.themeBaseHue;
    if (baseHue === null) return;

    let accentColor, bgColorStart, bgColorEnd;

    if (theme === 'dark') {
        accentColor = `hsl(${baseHue}, 80%, 60%)`;
        bgColorStart = `hsl(${baseHue}, 15%, 8%)`;
        bgColorEnd = `hsl(${(baseHue + 40) % 360}, 15%, 12%)`;
    } else {
        accentColor = `hsl(${baseHue}, 70%, 50%)`;
        bgColorStart = `hsl(${baseHue}, 30%, 95%)`;
        bgColorEnd = `hsl(${(baseHue + 40) % 360}, 30%, 92%)`;
    }

    document.documentElement.style.setProperty('--accent-color', accentColor);
    document.documentElement.style.setProperty('--primary-button-bg', accentColor);
    document.documentElement.style.setProperty('--background-start', bgColorStart);
    document.documentElement.style.setProperty('--background-end', bgColorEnd);
}

function applyTheme(theme) {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark-mode');
        if (dom.themeToggle) dom.themeToggle.innerHTML = sunIcon;
    } else {
        document.documentElement.classList.remove('dark-mode');
        if (dom.themeToggle) dom.themeToggle.innerHTML = moonIcon;
    }
    applyThemeColors(theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.classList.contains('dark-mode') ? 'dark' : 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
}

export function initializeTheme() {
    if (dom.themeToggle) {
        dom.themeToggle.addEventListener('click', toggleTheme);
    }

    state.themeBaseHue = Math.floor(Math.random() * 360);

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');

    applyTheme(currentTheme);

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            applyTheme(newTheme);
        }
    });
}
