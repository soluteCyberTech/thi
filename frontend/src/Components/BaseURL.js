export const URL = 'http://localhost:5000/'

// Authentication endpoints
export const login = URL + 'login'
export const changepassword = URL + 'changepassword'
export const createstaff = URL + 'createstaff'

// Department
export const reg_department = URL + 'departments'
export const update_department = (id) => URL + `departments/${id}`
export const delete_department = (id) => URL + `departments/${id}`

// HOD 
export const reg_hod = URL + 'hod'
export const update_hod = (id) => URL + `hod/${id}`
export const delete_hod = (id) => URL + `hod/${id}`
export const reg_hod_access = URL + 'hod-access'

// HOD Assignment 
// HOD Assignment endpoints
export const get_all_hod_assignments = URL + 'hod-assignments'
export const get_hod_assignments = URL + 'get_hod-assignments'
export const assign_hod_access = URL + 'hod-assignments'
export const get_hod_asighment = URL + 'hod-assignments'

// Department Users 
export const reg_department_user = URL + 'department-users'
export const update_department_user = (id) => URL + `department-users/${id}`
export const delete_department_user = (id) => URL + `department-users/${id}`
export const get_designations = URL + 'designations'

export const get_user_access = URL + `user-access`

// Desig
export const reg_designation = URL + 'designations'
export const update_designation = (id) => URL + `designations/${id}`
export const delete_designation = (id) => URL + `designations/${id}`

// Role Management 
export const reg_roles = URL + 'roles'

// Access Management endpoints
export const get_hoa_access = URL + 'hoa-access'
export const get_available_access = (section) => URL + `all-access/${section}`

// Department Access Management
export const get_available_department_access = (hodId) => URL + `department-available-access/${hodId}`
export const get_user_assigned_access = (userId) => URL + `department-user-access/${userId}`
export const update_user_access = (userId) => URL + `department-user-access/${userId}`

// NFF Import endpoint
export const nff_import = URL + 'nff-import'

export const get_fee_items = (standard) => URL + `api/fee-items/${standard}`
export const save_fees = URL + 'api/save-fees'

export const get_department_staff = (department) => URL + `department-staff/${department}`
export const check_user_access = (userId) => URL + `check-user-access/${userId}`
export const get_assembly_info = URL + 'assembly-info'