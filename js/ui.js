//
// File: js/ui.js
// Description: Controls all UI updates and DOM manipulations.
// Version: 2.1 (Full, Double-Checked Version)
//

import { parseDate } from './data.js';

// --- Date Formatting Helpers ---

function formatDateForDisplay(dateString) {
    const date = parseDate(dateString);
    if (!date) return '--';
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

function formatDateForInput(dateString) {
    const date = parseDate(dateString);
    if (!date) return '';
    return date.toISOString().split('T')[0];
}

// --- General UI Visibility ---

export function showLoginPage() {
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('dashboard').style.display = 'none';
}

export function showDashboard() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';
}

export function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
    const pageToShow = document.getElementById(`${pageId}Page`);
    if (pageToShow) {
        pageToShow.style.display = 'block';
    }
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === pageId);
    });
}

// --- Data Display ---

export function renderEmployeeTable(data) {
    const tbody = document.getElementById('employeeTableBody');
    const employeeCount = document.getElementById('employeeCount');

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-results">لا توجد نتائج</td></tr>';
        employeeCount.textContent = '0 موظف';
        return;
    }
    employeeCount.textContent = `${data.length} موظف`;
    tbody.innerHTML = data.map(employee => `
        <tr data-id="${employee['رقم الموظف']}">
            <td class="employee-id">${employee['رقم الموظف']}</td>
            <td>${employee['اسم الموظف باللغة العربية']}</td>
            <td>${employee['الجنسية']}</td>
            <td>${employee['المهنة']}</td>
            <td class="${employee['حالة التعاقد'] === 'نشط' ? 'status-active' : 'status-inactive'}">${employee['حالة التعاقد']}</td>
            <td class="salary">${employee['الراتب الحالي للموظف'] || 0} د.ك</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-info btn-sm" data-action="view" title="عرض"><i class="fas fa-eye"></i></button>
                    <button class="btn btn-warning btn-sm" data-action="edit" title="تعديل"><i class="fas fa-edit"></i></button>
                    <button class="btn btn-danger btn-sm" data-action="delete" title="حذف"><i class="fas fa-trash"></i></button>
                </div>
            </td>
        </tr>
    `).join('');
}

export function updateStatistics(employees) {
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(emp => emp['حالة التعاقد'] === 'نشط').length;
    const inactiveEmployees = totalEmployees - activeEmployees;
    const avgSalary = totalEmployees > 0 ?
        Math.round(employees.reduce((sum, emp) => sum + Number(emp['الراتب الحالي للموظف'] || 0), 0) / totalEmployees) : 0;

    document.getElementById('totalEmployees').textContent = totalEmployees;
    document.getElementById('activeEmployees').textContent = activeEmployees;
    document.getElementById('inactiveEmployees').textContent = inactiveEmployees;
    document.getElementById('avgSalary').textContent = `${avgSalary} د.ك`;
}

export function populateFilters(employees) {
    const createOptions = (key) => [...new Set(employees.map(emp => emp[key]).filter(Boolean))].sort().map(val => `<option value="${val}">${val}</option>`).join('');
    document.getElementById('nationalityFilter').innerHTML = `<option value="">جميع الجنسيات</option>${createOptions('الجنسية')}`;
    document.getElementById('jobFilter').innerHTML = `<option value="">جميع المهن</option>${createOptions('المهنة')}`;
    document.getElementById('workScheduleFilter').innerHTML = `<option value="">كل أنظمة الدوام</option>${createOptions('نظام الدوام')}`;
}

export function clearFilters() {
    document.getElementById('searchInput').value = '';
    ['nationalityFilter', 'statusFilter', 'jobFilter', 'workScheduleFilter'].forEach(id => {
        document.getElementById(id).value = '';
    });
    showNotification('تم عرض كل الموظفين', 'info');
}

export function showEmployeeDetails(employee) {
    hideMainListView();
    document.getElementById('employeeDetails').style.display = 'block';

    const detailsContent = document.getElementById('employeeDetailsContent');
    const getDetail = (key) => employee[key] || '--';

    detailsContent.innerHTML = `
        <div class="details-header"><h2>${getDetail('اسم الموظف باللغة العربية')}</h2><p>${getDetail('اسم الموظف باللغة الإنجليزية')}</p></div>
        <div class="details-grid">
            <div class="detail-section"><h3>المعلومات الأساسية</h3>
                <div class="detail-row"><span class="detail-label">رقم الموظف:</span><span class="detail-value">${getDetail('رقم الموظف')}</span></div>
                <div class="detail-row"><span class="detail-label">البطاقة المدنية:</span><span class="detail-value">${getDetail('البطاقة المدنية')}</span></div>
                <div class="detail-row"><span class="detail-label">انتهاء البطاقة:</span><span class="detail-value">${formatDateForDisplay(getDetail('تاريخ انتهاء البطاقة'))}</span></div>
                <div class="detail-row"><span class="detail-label">الجنسية:</span><span class="detail-value">${getDetail('الجنسية')}</span></div>
                <div class="detail-row"><span class="detail-label">رقم الجواز:</span><span class="detail-value">${getDetail('رقم جواز السفر')}</span></div>
                <div class="detail-row"><span class="detail-label">انتهاء الجواز:</span><span class="detail-value">${formatDateForDisplay(getDetail('تاريخ انتهاء الجواز'))}</span></div>
            </div>
            <div class="detail-section"><h3>معلومات الوظيفة</h3>
                <div class="detail-row"><span class="detail-label">تاريخ التعاقد:</span><span class="detail-value">${formatDateForDisplay(getDetail('تاريخ التعاقد'))}</span></div>
                <div class="detail-row"><span class="detail-label">الحالة:</span><span class="detail-value ${getDetail('حالة التعاقد') === 'نشط' ? 'status-active' : 'status-inactive'}">${getDetail('حالة التعاقد')}</span></div>
                <div class="detail-row"><span class="detail-label">المهنة:</span><span class="detail-value">${getDetail('المهنة')}</span></div>
                <div class="detail-row"><span class="detail-label">نظام الدوام:</span><span class="detail-value">${getDetail('نظام الدوام')}</span></div>
                <div class="detail-row"><span class="detail-label">الراتب الحالي:</span><span class="detail-value salary">${getDetail('الراتب الحالي للموظف')} د.ك</span></div>
                <div class="detail-row"><span class="detail-label">موقع العمل:</span><span class="detail-value">${getDetail('موقع العمل')}</span></div>
            </div>
            <div class="detail-section"><h3>معلومات الشركة</h3>
                <div class="detail-row"><span class="detail-label">اسم الشركة:</span><span class="detail-value">${getDetail('اسم الشركة')}</span></div>
                <div class="detail-row"><span class="detail-label">ملاحظات إدارية:</span><span class="detail-value">${getDetail('ملاحظات إدارية')}</span></div>
                <div class="detail-row"><span class="detail-label">راتب إذن العمل:</span><span class="detail-value">${getDetail('الراتب حسب اذن العمل')} د.ك</span></div>
                <div class="detail-row"><span class="detail-label">اضافات اخرى:</span><span class="detail-value">${getDetail('اضافات اخرى')}</span></div>
            </div>
        </div>`;
}


// --- Form Handling ---

export function showEmployeeForm(employeeData, fieldMap) {
    hideMainListView();
    document.getElementById('employeeForm').style.display = 'block';
    document.getElementById('employeeDataForm').reset();
    switchTab('personal');
    if (employeeData) {
        populateForm(employeeData, fieldMap);
    }
}

export function hideEmployeeForm() {
    document.getElementById('employeeForm').style.display = 'none';
    showEmployeeList();
}

function populateForm(employee, fieldMap) {
    for (const [formId, dataKey] of Object.entries(fieldMap)) {
        const element = document.getElementById(formId);
        if (element && employee[dataKey] !== undefined) {
            const isDateField = ['civilIdExpiry', 'passportExpiry', 'contractDate'].includes(formId);
            element.value = isDateField ? formatDateForInput(employee[dataKey]) : employee[dataKey];
        }
    }
}

export function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`${tabId}-tab`).classList.add('active');
}

// --- List/Details Toggles ---

export function showEmployeeList() {
    document.getElementById('employeeDetails').style.display = 'none';
    document.getElementById('employeeForm').style.display = 'none';
    document.getElementById('employeeList').style.display = 'block';
    document.querySelector('.search-filter').style.display = 'flex';
}

function hideMainListView() {
    document.getElementById('employeeList').style.display = 'none';
    document.querySelector('.search-filter').style.display = 'none';
}

// --- Modals ---

export function showDeleteModal() {
    document.getElementById('deleteModal').style.display = 'block';
    document.getElementById('deleteConfirmCheckbox').checked = false;
    document.getElementById('deleteConfirmText').value = '';
    document.getElementById('confirmDeleteBtn').disabled = true;
}

export function hideDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}

export function checkDeleteConfirmation() {
    const checkbox = document.getElementById('deleteConfirmCheckbox').checked;
    const textInput = document.getElementById('deleteConfirmText').value.trim();
    document.getElementById('confirmDeleteBtn').disabled = !(checkbox && textInput === 'حذف بيانات');
}

export function showRestoreModal(fileName) {
    document.getElementById('restoreFileName').textContent = fileName;
    document.getElementById('restoreModal').style.display = 'block';
}

export function hideRestoreModal() {
    document.getElementById('restoreModal').style.display = 'none';
}

// --- UI Helpers ---

export function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const header = document.querySelector('.header');
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('expanded');
    header.classList.toggle('expanded');
    const isCollapsed = sidebar.classList.contains('collapsed');
    document.querySelector('#sidebarToggle i').className = `fas fa-chevron-${isCollapsed ? 'left' : 'right'}`;
    document.querySelector('#sidebarToggle .toggle-text').textContent = isCollapsed ? 'عرض' : 'إخفاء';
}

export function updateDateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kuwait' };
    document.getElementById('currentDateTime').textContent = now.toLocaleDateString('ar-KW', options);
}

export function showLoadingOverlay(message) {
    document.getElementById('loadingMessage').textContent = message;
    document.getElementById('dataLoadingOverlay').style.display = 'flex';
}

export function hideLoadingOverlay() {
    document.getElementById('dataLoadingOverlay').style.display = 'none';
}

export function updateLoadingMessage(message) {
    document.getElementById('loadingMessage').textContent = message;
}

export function showNotification(message, type = 'success') {
    const existing = document.querySelector('.notification');
    if(existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    const iconClass = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
    notification.innerHTML = `<i class="fas ${iconClass}"></i><span>${message}</span>`;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s ease';
        setTimeout(() => notification.remove(), 500);
    }, 4000);
}