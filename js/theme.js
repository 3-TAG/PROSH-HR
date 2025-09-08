//
// File: js/theme.js
// Description: Manages the application's visual theme (color palette and mode).
//

const THEME_STORAGE_KEY = 'hr_theme_v2';

/**
 * Applies a selected theme (e.g., 'professional-blue') while preserving the current mode (light/dark).
 * @param {string} themeName - The name of the theme to apply.
 */
export function applyTheme(themeName) {
    const [_, currentMode] = getThemeAndMode();
    const newTheme = `${themeName}-${currentMode}`;
    document.body.dataset.theme = newTheme;
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    updateThemeButtons(themeName);
}

/**
 * Toggles the current theme between light and dark mode.
 */
export function toggleThemeMode() {
    const [currentTheme, currentMode] = getThemeAndMode();
    const newMode = currentMode === 'light' ? 'dark' : 'light';
    const newTheme = `${currentTheme}-${newMode}`;
    document.body.dataset.theme = newTheme;
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    updateThemeIcon(newMode);
}

/**
 * Initializes the theme on application startup from localStorage.
 */
export function initializeTheme() {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || 'professional-blue-light';
    document.body.dataset.theme = savedTheme;
    const [themeName, mode] = getThemeAndMode();
    updateThemeButtons(themeName);
    updateThemeIcon(mode);
}

/**
 * Helper function to parse the theme name and mode from the body's data attribute.
 * @returns {Array<string>} An array containing [themeName, mode].
 */
function getThemeAndMode() {
    const currentTheme = document.body.dataset.theme || 'professional-blue-light';
    const parts = currentTheme.split('-');
    const mode = parts.pop();
    const themeName = parts.join('-');
    return [themeName, mode];
}

/**
 * Updates the visual state of the theme selection buttons in the settings.
 * @param {string} activeTheme - The name of the currently active theme.
 */
function updateThemeButtons(activeTheme) {
    document.querySelectorAll('.theme-button').forEach(button => {
        button.classList.toggle('active', button.dataset.theme === activeTheme);
    });
}

/**
 * Updates the sun/moon icon in the header.
 * @param {string} mode - The current mode ('light' or 'dark').
 */
function updateThemeIcon(mode) {
    const icon = document.querySelector('#headerThemeToggle i');
    if (icon) {
        icon.className = `fas fa-${mode === 'dark' ? 'sun' : 'moon'}`;
    }
}