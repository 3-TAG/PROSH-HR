// File: js/auth.js
// Description: Manages user authentication state.

import { showNotification } from './ui.js';

// NOTE: This is client-side authentication and is NOT secure.
// For a production app, this logic MUST be moved to a backend server.
const VALID_USERNAME = 'ADMIN';
const VALID_PASSWORD = 'admin';

export function checkAuthentication() {
    return localStorage.getItem('hr_authenticated') === 'true';
}

export function handleLogin(username, password) {
    if (username.toUpperCase() === VALID_USERNAME && password === VALID_PASSWORD) {
        localStorage.setItem('hr_authenticated', 'true');
        return true;
    }
    showNotification('اسم المستخدم أو كلمة المرور غير صحيحة', 'error');
    return false;
}

export function handleLogout() {
    localStorage.removeItem('hr_authenticated');
    location.reload();
}