//
// File: js/data.js
// Description: Handles all data management and state for employees.
// Version: 2.1 (Full, Double-Checked Version)
//

import { showNotification, updateLoadingMessage } from './ui.js';
import { INITIAL_EMPLOYEES_DATA } from './config.js';

let employees = [];
let filteredEmployees = [];

// --- Getters ---
export const getEmployees = () => employees;
export const getFilteredEmployees = () => filteredEmployees;

// --- Optimized Date Parsing Utility ---

/**
 * Intelligently parses a date string from various formats (YYYY-MM-DD, DD/MM/YYYY, etc.)
 * and constructs a Date object in UTC to prevent timezone shifts.
 * @param {string | Date} dateString The date string to parse.
 * @returns {Date | null} A Date object if parsing is successful, otherwise null.
 */
export function parseDate(dateString) {
    if (!dateString || typeof dateString !== 'string' || dateString.trim() === '--' || dateString.trim() === '') {
        return null;
    }
    const str = dateString.trim();
    let year, month, day;
    let match;

    match = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (match) {
        [, year, month, day] = match.map(Number);
    } else {
        match = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
        if (match) {
            [, day, month, year] = match.map(Number);
        } else {
            return null;
        }
    }

    if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) {
        return null;
    }
    
    const utcDate = new Date(Date.UTC(year, month - 1, day));

    if (utcDate.getUTCFullYear() !== year || utcDate.getUTCMonth() !== month - 1 || utcDate.getUTCDate() !== day) {
        return null;
    }
    return utcDate;
}

// --- Data Loading and Initializing ---

export async function loadInitialData() {
    const filePaths = [
        { path: 'db/DB.xlsx', type: 'arrayBuffer', ext: 'xlsx' },
        { path: 'db/DB.json', type: 'text', ext: 'json' },
        { path: 'db/DB.yml', type: 'text', ext: 'yml' },
        { path: 'db/DB.csv', type: 'text', ext: 'csv' }
    ];

    for (const fileInfo of filePaths) {
        try {
            updateLoadingMessage(`جاري التحقق من وجود ${fileInfo.path}...`);
            const response = await fetch(fileInfo.path, { cache: "no-store" });
            if (response.ok) {
                console.log(`Found database file: ${fileInfo.path}`);
                const content = await response[fileInfo.type]();
                const parsedData = parseFileContent(content, fileInfo.ext);

                if (parsedData && Array.isArray(parsedData) && parsedData.length > 0) {
                    employees = parsedData;
                    saveEmployeesToStorage();
                    showNotification(`تم تحميل ${employees.length} موظف من ملف البيانات`, 'success');
                    return true;
                }
            }
        } catch (error) {
            console.log(`Could not fetch ${fileInfo.path}: ${error.message}`);
        }
    }
    return false;
}

function parseFileContent(content, extension) {
    let rawData;
    try {
        switch (extension) {
            case 'xlsx':
            case 'xls':
                const workbook = XLSX.read(content, { type: 'array', cellDates: true });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                rawData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });
                break;
            case 'csv':
                rawData = parseCsv(content);
                break;
            case 'json':
                rawData = JSON.parse(content);
                break;
            case 'yml':
            case 'yaml':
                rawData = jsyaml.load(content);
                break;
            default: return [];
        }
        return Array.isArray(rawData) ? standardizeData(rawData) : [];
    } catch (error) {
        console.error(`Error parsing ${extension} file:`, error);
        showNotification(`خطأ في تحليل ملف البيانات: ${error.message}`, 'error');
        return [];
    }
}

function parseCsv(csvText) {
    const lines = csvText.trim().split(/\r?\n/);
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        return headers.reduce((obj, header, index) => {
            obj[header] = values[index] || '';
            return obj;
        }, {});
    });
}

function standardizeData(dataArray) {
    const formatDateForDisplay = (dateString) => {
        const date = parseDate(dateString);
        if (!date) return '--';
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return `${year}/${month}/${day}`;
    };

    const dateKeys = ['تاريخ انتهاء البطاقة', 'تاريخ انتهاء الجواز', 'تاريخ التعاقد'];
    return dataArray.map(employee => {
        const newEmployee = {};
        for (const key in employee) {
            const trimmedKey = key.trim();
            const value = employee[key];
            newEmployee[trimmedKey] = dateKeys.includes(trimmedKey) ? formatDateForDisplay(value) : value;
        }
        return newEmployee;
    });
}

// --- Local Storage ---

export function loadEmployeesFromStorage() {
    const data = localStorage.getItem('hrSystemData');
    if (data) {
        try {
            employees = JSON.parse(data).employees || [];
        } catch {
            employees = [];
        }
    } else {
        employees = [];
    }
}

export function saveEmployeesToStorage() {
    const dataToSave = {
        employees: employees,
        lastUpdate: new Date().toISOString()
    };
    localStorage.setItem('hrSystemData', JSON.stringify(dataToSave));
}

// --- CRUD Operations ---

export function getEmployeeById(id) {
    return employees.find(emp => String(emp['رقم الموظف']) === String(id));
}

export function addEmployee(employeeData) {
    employees.push(employeeData);
}

export function updateEmployee(employeeData) {
    const id = employeeData['رقم الموظف'];
    const index = employees.findIndex(emp => String(emp['رقم الموظف']) === String(id));
    if (index !== -1) {
        employees[index] = employeeData;
        return true;
    }
    return false;
}

export function deleteEmployeeById(id) {
    employees = employees.filter(emp => String(emp['رقم الموظف']) !== String(id));
}

export function isEmployeeIdTaken(id) {
    return employees.some(emp => String(emp['رقم الموظف']) === String(id));
}

// --- Filtering ---
export function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const nationality = document.getElementById('nationalityFilter').value;
    const status = document.getElementById('statusFilter').value;
    const job = document.getElementById('jobFilter').value;
    const schedule = document.getElementById('workScheduleFilter').value;

    filteredEmployees = employees.filter(emp =>
        (!nationality || emp['الجنسية'] === nationality) &&
        (!status || emp['حالة التعاقد'] === status) &&
        (!job || emp['المهنة'] === job) &&
        (!schedule || emp['نظام الدوام'] === schedule) &&
        (
            (emp['اسم الموظف باللغة العربية'] || '').toLowerCase().includes(searchTerm) ||
            (emp['اسم الموظف باللغة الإنجليزية'] || '').toLowerCase().includes(searchTerm) ||
            (String(emp['رقم الموظف']) || '').includes(searchTerm)
        )
    );
}

// --- Utilities ---

export function downloadSampleTemplate() {
    const ws = XLSX.utils.json_to_sheet(INITIAL_EMPLOYEES_DATA);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
    XLSX.writeFile(wb, 'DATABASE_template.xlsx');
    showNotification('تم تحميل الملف النموذج بنجاح', 'success');
}

export function clearAllData() {
    if (confirm('هل أنت متأكد من حذف جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه.') &&
        confirm('تأكيد أخير: سيتم حذف جميع بيانات الموظفين نهائياً!')) {
        employees = [];
        localStorage.removeItem('hrSystemData');
        return true;
    }
    return false;
}

export function generateEmployeeId() {
    const maxId = employees.reduce((max, emp) => {
        const id = parseInt(emp['رقم الموظف'], 10);
        return id > max ? id : max;
    }, 60000);
    return String(maxId + 1);
}

export function fetchEmployeesFromFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error('خطأ في قراءة الملف'));
        reader.onload = e => {
            try {
                resolve(parseFileContent(e.target.result, extension));
            } catch (error) {
                reject(error);
            }
        };
        ['xlsx', 'xls'].includes(extension) ? reader.readAsArrayBuffer(file) : reader.readAsText(file);
    });
}

export function restoreBackup(importedEmployees) {
    employees = importedEmployees;
}