//
// File: js/config.js
// Description: Stores static configuration for the application.
//

/**
 * Maps form input IDs to the data keys used in the employee object.
 * This makes saving and loading form data much cleaner.
 */
export const EMPLOYEE_FIELD_MAP = {
    'employeeNumber': 'رقم الموظف',
    'arabicName': 'اسم الموظف باللغة العربية',
    'englishName': 'اسم الموظف باللغة الإنجليزية',
    'civilId': 'البطاقة المدنية',
    'civilIdExpiry': 'تاريخ انتهاء البطاقة',
    'nationality': 'الجنسية',
    'passportNumber': 'رقم جواز السفر',
    'passportExpiry': 'تاريخ انتهاء الجواز',
    'unifiedNumber': 'الرقم الموحد',
    'contractDate': 'تاريخ التعاقد',
    'contractStatus': 'حالة التعاقد',
    'workSite': 'موقع العمل',
    'jobTitle': 'المهنة',
    'workSchedule': 'نظام الدوام',
    'currentSalary': 'الراتب الحالي للموظف',
    'workPermitSalary': 'الراتب حسب اذن العمل',
    'companyName': 'اسم الشركة',
    'adminNotes': 'ملاحظات إدارية',
    'additionalNotes': 'اضافات اخرى'
};

/**
 * Sample data used for the "Download Template" feature.
 */
export const INITIAL_EMPLOYEES_DATA = [
    {
        'رقم الموظف': '60000',
        'اسم الموظف باللغة العربية': 'حسن فلاح المعصب',
        'البطاقة المدنية': '293293293293',
        'تاريخ انتهاء البطاقة': '2026/06/29',
        'الجنسية': 'كويتي',
        'رقم جواز السفر': 'A12345678',
        'تاريخ انتهاء الجواز': '2088/11/10',
        'الرقم الموحد': '123456789',
        'تاريخ التعاقد': '1993/07/09',
        'حالة التعاقد': 'منتهى',
        'موقع العمل': 'عماله وطنية الكويتيين - الإدارة الرئيسية',
        'اسم الشركة': 'شركة بروش انترناشونال لخدمات التنظيف',
        'الراتب الحالي للموظف': '800',
        'الراتب حسب اذن العمل': '700',
        'المهنة': 'مدير عام',
        'نظام الدوام': 'دوامين',
        'اسم الموظف باللغة الإنجليزية': 'HASSAN FALAH ALMOASB',
        'ملاحظات إدارية': 'باب خامس (الكويتيين)',
        'اضافات اخرى': 'لا توجد إضافات'
    }
];

/**
 * A list of form field IDs that are mandatory for form submission.
 */
export const REQUIRED_FORM_FIELDS = [
    'employeeNumber', 'arabicName', 'englishName', 'civilId', 
    'civilIdExpiry', 'nationality', 'contractDate', 'contractStatus', 
    'jobTitle', 'workSchedule', 'currentSalary'
];