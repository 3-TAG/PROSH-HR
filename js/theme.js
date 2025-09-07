// File: js/theme.js
// Description: Manages the application's color theme.

const THEME_STORAGE_KEY = 'hr_theme';

export function applyTheme(themeName) {
    const [theme, mode] = getThemeAndMode(document.body.dataset.theme);
    document.body.dataset.theme = `${themeName}-${mode}`;
    localStorage.setItem(THEME_STORAGE_KEY, `${themeName}-${mode}`);
    updateThemeButtons(themeName);
}

export function toggleThemeMode() {
    const [theme, mode] = getThemeAndMode(document.body.dataset.theme);
    const newMode = mode === 'light' ? 'dark' : 'light';
    document.body.dataset.theme = `${theme}-${newMode}`;
    localStorage.setItem(THEME_STORAGE_KEY, `${theme}-${newMode}`);
}

export function initializeTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'professional-blue-light';
    document.body.dataset.theme = savedTheme;
    const [theme] = getThemeAndMode(savedTheme);
    updateThemeButtons(theme);
}

function getThemeAndMode(datasetTheme) {
    const parts = datasetTheme.split('-');
    const mode = parts.pop();
    const theme = parts.join('-');
    return [theme, mode];
}

function updateThemeButtons(activeTheme) {
    document.querySelectorAll('.theme-button').forEach(button => {
        button.classList.toggle('active', button.dataset.theme === activeTheme);
    });
}