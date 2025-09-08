//
// File: js/auth.js
// Description: Manages user authentication state.
// WARNING: This is a client-side mock and is NOT secure.
//

import { showNotification } from './ui.js';

const VALID_USERNAME = 'ADMIN';
const VALID_PASSWORD = 'admin';

/**
 * Checks if the user is authenticated by looking at localStorage.
 * @returns {boolean} True if authenticated, false otherwise.
 */
export function checkAuthentication() {
    return localStorage.getItem('hr_authenticated') === 'true';
}

/**
 * Attempts to log the user in.
 * @param {string} username - The username entered by the user.
 * @param {string} password - The password entered by the user.
 * @returns {boolean} True on successful login, false otherwise.
 */
export function handleLogin(username, password) {
    if (username.toUpperCase() === VALID_USERNAME && password === 'admin') {
        localStorage.setItem('hr_authenticated', 'true');
        return true;
    }
    document.getElementById('loginErrorMessage').textContent = 'اسم المستخدم أو كلمة المرور غير صحيحة';
    return false;
}

/**
 * Logs the user out by clearing the auth flag and reloading the page.
 */
export function handleLogout() {
    localStorage.removeItem('hr_authenticated');
    location.reload();
}