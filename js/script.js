const THEME_STORAGE_KEY = 'coffee-house-theme';
const LIGHT_THEME = 'light';
const DARK_THEME = 'dark';

const root = document.documentElement;

function getSavedTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    return savedTheme === DARK_THEME ? DARK_THEME : LIGHT_THEME;
}

function applyTheme(theme) {
    root.dataset.theme = theme;

    const themeToggle = document.querySelector('.header__theme-toggle');

    if (!themeToggle) {
        return;
    }

    const isDarkTheme = theme === DARK_THEME;

    themeToggle.setAttribute('aria-pressed', String(isDarkTheme));
    themeToggle.setAttribute(
        'aria-label',
        isDarkTheme
            ? 'Switch to light theme'
            : 'Switch to dark theme'
    );
}

function toggleTheme() {
    const currentTheme = root.dataset.theme;
    const nextTheme =
        currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;

    localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyTheme(nextTheme);
}

applyTheme(getSavedTheme());

document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.querySelector('.header__theme-toggle');

    if (themeToggle) {
        applyTheme(root.dataset.theme);
        themeToggle.addEventListener('click', toggleTheme);
    }
});
