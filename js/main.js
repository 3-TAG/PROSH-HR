// File: js/main.js
// Description: The main entry point for the application. Initializes all modules and sets up event listeners.

import * as Auth from './auth.js';
import * as Data from './data.js';
import * as UI from './ui.js';
import * as Theme from './theme.js';

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    Theme.initializeTheme();
    if (Auth.checkAuthentication()) {
        initializeApp();
    } else {
        UI.showLoginPage();
    }
    setupEventListeners();
});

async function initializeApp() {
    UI.showDashboard();
    await Data.loadInitialData(); // This function would now live in data.js
    // Initial render calls
    UI.updateStatistics(Data.getEmployees());
    UI.renderEmployeeTable(Data.getFilteredEmployees());
    // ... etc.
}


// --- EVENT LISTENERS ---
function setupEventListeners() {
    // Authentication
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = loginForm.username.value;
        const password = loginForm.password.value;
        if (Auth.handleLogin(username, password)) {
            initializeApp();
        }
    });

    document.getElementById('logoutBtn').addEventListener('click', Auth.handleLogout);

    // Theme Switcher
    document.querySelectorAll('.theme-button').forEach(button => {
        button.addEventListener('click', (e) => {
            Theme.applyTheme(e.target.dataset.theme);
        });
    });

    // Add other event listeners for sidebar, forms, buttons, filters etc.
    // They will call functions from the UI and Data modules.
    // Example:
    document.getElementById('addEmployeeBtn').addEventListener('click', () => {
        UI.showEmployeeForm(); // Just shows the form
    });
    
    document.getElementById('employeeDataForm').addEventListener('submit', handleSaveEmployee);
}

function handleSaveEmployee(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const employeeObject = Object.fromEntries(formData.entries());
    
    // Logic to determine if it's an edit or new add
    const isEditMode = false; // You'd manage this state
    
    if (isEditMode) {
        Data.updateEmployee(employeeObject);
    } else {
        Data.addEmployee(employeeObject);
    }
    
    Data.saveEmployeesToStorage();
    // Re-render the necessary parts of the UI
    UI.renderEmployeeTable(Data.getFilteredEmployees());
    UI.showNotification('تم الحفظ بنجاح', 'success');
}