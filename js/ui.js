// File: js/ui.js
// Description: Controls all UI updates and DOM interactions.

// This module should not know about the 'employees' array.
// It receives data and renders it.

export function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.style.display = 'none');
    const pageToShow = document.getElementById(`${pageId}Page`);
    if (pageToShow) {
        pageToShow.style.display = 'block';
    }
}

export function renderEmployeeTable(data) {
    const tbody = document.getElementById('employeeTableBody');
    const employeeCount = document.getElementById('employeeCount');
    if (!tbody || !employeeCount) return;

    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="no-results">لا توجد نتائج</td></tr>';
        employeeCount.textContent = '0 موظف';
        return;
    }
    // ... logic to build and render the table rows from the 'data' parameter
}

// ... (All other DOM functions: updateStatistics, showNotification, populateFilters, etc.)