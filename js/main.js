//
// File: js/main.js
// Description: Main application entry point. Initializes modules and sets up event listeners.
//

import * as Auth from './auth.js';
import * as Data from './data.js';
import * as UI from './ui.js';
import * as Theme from './theme.js';
import { EMPLOYEE_FIELD_MAP, REQUIRED_FORM_FIELDS } from './config.js';

// --- Application State ---
let currentEmployeeId = null;
let isEditMode = false;
let importedFile = null;

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    Theme.initializeTheme();
    UI.updateDateTime();
    setInterval(UI.updateDateTime, 60000); // Update every minute

    if (Auth.checkAuthentication()) {
        initializeApp();
    } else {
        UI.showLoginPage();
    }
    setupEventListeners();
});

async function initializeApp() {
    UI.showDashboard();
    UI.showLoadingOverlay('جاري تحميل بيانات الموظفين...');
    const loadedFromFile = await Data.loadInitialData();
    if (!loadedFromFile) {
        Data.loadEmployeesFromStorage();
    }
    UI.hideLoadingOverlay();
    
    // Initial render
    refreshAllDataViews();
    UI.showPage('dashboard');
}

// --- Data & UI Refresh ---

function refreshAllDataViews() {
    Data.applyFilters();
    UI.renderEmployeeTable(Data.getFilteredEmployees());
    UI.updateStatistics(Data.getEmployees());
    UI.populateFilters(Data.getEmployees());
    // Add other view updates here, e.g., UI.renderAlerts(Data.getEmployees());
}

// --- Event Handlers ---

function handleSaveEmployee(e) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    // Basic validation
    for (const field of REQUIRED_FORM_FIELDS) {
        if (!formData.get(field)) {
            UI.showNotification('يرجى ملء جميع الحقول الإلزامية (*)', 'warning');
            return;
        }
    }

    const newEmployeeId = formData.get('employeeNumber');
    if (!isEditMode && Data.isEmployeeIdTaken(newEmployeeId)) {
        UI.showNotification('رقم الموظف موجود مسبقاً، يرجى استخدام رقم آخر', 'error');
        return;
    }

    const employeeData = {};
    for (const [formId, dataKey] of Object.entries(EMPLOYEE_FIELD_MAP)) {
        employeeData[dataKey] = formData.get(formId);
    }
    
    if (isEditMode) {
        Data.updateEmployee(employeeData);
    } else {
        Data.addEmployee(employeeData);
    }

    Data.saveEmployeesToStorage();
    refreshAllDataViews();
    UI.hideEmployeeForm();
    UI.showNotification('تم حفظ بيانات الموظف بنجاح', 'success');
}

function handleTableActions(e) {
    const target = e.target.closest('button');
    if (!target) return;
    
    const action = target.dataset.action;
    const row = target.closest('tr');
    const id = row.dataset.id;
    
    if (!action || !id) return;
    
    currentEmployeeId = id;
    const employee = Data.getEmployeeById(id);

    switch(action) {
        case 'view':
            UI.showEmployeeDetails(employee);
            break;
        case 'edit':
            isEditMode = true;
            UI.showEmployeeForm(employee, EMPLOYEE_FIELD_MAP);
            break;
        case 'delete':
            UI.showDeleteModal();
            break;
    }
}

function confirmDelete() {
    Data.deleteEmployeeById(currentEmployeeId);
    Data.saveEmployeesToStorage();
    refreshAllDataViews();
    UI.hideDeleteModal();
    UI.showNotification('تم حذف الموظف بنجاح', 'success');
}

function handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    importedFile = file;
    UI.showRestoreModal(file.name);
    e.target.value = ''; // Reset input
}

async function confirmRestore() {
    if (!importedFile) return;
    try {
        const importedEmployees = await Data.fetchEmployeesFromFile(importedFile);
        if (importedEmployees && Array.isArray(importedEmployees)) {
            Data.restoreBackup(importedEmployees);
            Data.saveEmployeesToStorage();
            refreshAllDataViews();
            UI.showNotification('تم استيراد البيانات بنجاح', 'success');
        } else {
            UI.showNotification('ملف البيانات غير صحيح أو فارغ', 'error');
        }
    } catch (error) {
        UI.showNotification(`خطأ في قراءة الملف: ${error.message}`, 'error');
    }
    UI.hideRestoreModal();
}

// --- Event Listener Setup ---

function setupEventListeners() {
    // --- Auth ---
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const { username, password } = e.target.elements;
        if (Auth.handleLogin(username.value, password.value)) {
            initializeApp();
        }
    });
    document.getElementById('logoutBtn').addEventListener('click', Auth.handleLogout);

    // --- Navigation & Sidebar ---
    document.querySelector('.sidebar-menu').addEventListener('click', (e) => {
        const menuItem = e.target.closest('.menu-item');
        if (menuItem) {
            e.preventDefault();
            UI.showPage(menuItem.dataset.page);
        }
    });
    document.getElementById('sidebarToggle').addEventListener('click', UI.toggleSidebar);
    
    // --- Theme ---
    document.getElementById('headerThemeToggle').addEventListener('click', Theme.toggleThemeMode);
    document.querySelector('.theme-switcher').addEventListener('click', (e) => {
        const themeButton = e.target.closest('.theme-button');
        if (themeButton) {
            Theme.applyTheme(themeButton.dataset.theme);
        }
    });

    // --- Employee Page ---
    document.getElementById('addEmployeeBtn').addEventListener('click', () => {
        isEditMode = false;
        currentEmployeeId = null;
        UI.showEmployeeForm(null, EMPLOYEE_FIELD_MAP);
        document.getElementById('employeeNumber').value = Data.generateEmployeeId();
    });
    document.getElementById('employeeTableBody').addEventListener('click', handleTableActions);
    document.getElementById('backBtn').addEventListener('click', UI.showEmployeeList);
    
    // --- Filters ---
    document.getElementById('searchInput').addEventListener('input', () => {
        Data.applyFilters();
        UI.renderEmployeeTable(Data.getFilteredEmployees());
    });
    ['nationalityFilter', 'statusFilter', 'jobFilter', 'workScheduleFilter'].forEach(id => {
        document.getElementById(id).addEventListener('change', () => {
            Data.applyFilters();
            UI.renderEmployeeTable(Data.getFilteredEmployees());
        });
    });
    document.getElementById('clearFiltersBtn').addEventListener('click', () => {
        UI.clearFilters();
        Data.applyFilters();
        UI.renderEmployeeTable(Data.getFilteredEmployees());
    });

    // --- Employee Form ---
    document.getElementById('employeeDataForm').addEventListener('submit', handleSaveEmployee);
    document.getElementById('cancelFormBtn').addEventListener('click', UI.hideEmployeeForm);
    document.querySelector('.form-tabs').addEventListener('click', (e) => {
        if (e.target.classList.contains('tab-btn')) {
            UI.switchTab(e.target.dataset.tab);
        }
    });

    // --- Modals ---
    document.getElementById('closeDeleteModal').addEventListener('click', UI.hideDeleteModal);
    document.getElementById('cancelDeleteBtn').addEventListener('click', UI.hideDeleteModal);
    document.getElementById('deleteConfirmCheckbox').addEventListener('change', UI.checkDeleteConfirmation);
    document.getElementById('deleteConfirmText').addEventListener('input', UI.checkDeleteConfirmation);
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDelete);
    
    document.getElementById('closeRestoreModal').addEventListener('click', UI.hideRestoreModal);
    document.getElementById('cancelRestoreBtn').addEventListener('click', UI.hideRestoreModal);
    document.getElementById('confirmRestoreBtn').addEventListener('click', confirmRestore);
    
    // --- Settings ---
    document.getElementById('downloadTemplateBtn').addEventListener('click', Data.downloadSampleTemplate);
    document.getElementById('importDataInput').addEventListener('change', handleFileImport);
    document.getElementById('clearDataBtn').addEventListener('click', () => {
        if (Data.clearAllData()) {
            refreshAllDataViews();
            UI.showNotification('تم حذف جميع البيانات بنجاح', 'success');
        }
    });
}