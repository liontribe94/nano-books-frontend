const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiRequest = async (endpoint, options = {}) => {
    const token = localStorage.getItem('token');
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.error || error.message || response.statusText);
    }

    return response.json();
};

export const api = {
    // Auth / Users
    auth: {
        login: (credentials) => apiRequest('/users/login', { method: 'POST', body: JSON.stringify(credentials) }),
        register: (data) => apiRequest('/users/register', { method: 'POST', body: JSON.stringify(data) }),
        getProfile: () => apiRequest('/users/profile'),
    },

    // Organization / Team
    organization: {
        get: () => apiRequest('/organization'),
        team: {
            getMembers: () => apiRequest('/organization/team'),
            updateRole: (userId, role) => apiRequest(`/organization/team/${userId}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
            remove: (userId) => apiRequest(`/organization/team/${userId}`, { method: 'DELETE' }),
        },
        invitations: {
            getAll: () => apiRequest('/organization/invitations'),
            create: (data) => apiRequest('/organization/invitations', { method: 'POST', body: JSON.stringify(data) }),
            revoke: (id) => apiRequest(`/organization/invitations/${id}`, { method: 'DELETE' }),
        }
    },

    // Customers
    customers: {
        getAll: () => apiRequest('/customers'),
        getOne: (id) => apiRequest(`/customers/${id}`),
        create: (data) => apiRequest('/customers', { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => apiRequest(`/customers/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
        delete: (id) => apiRequest(`/customers/${id}`, { method: 'DELETE' }),
    },

    // Invoices
    invoices: {
        getAll: () => apiRequest('/invoices', { method: 'GET' }),
        getOne: (id) => apiRequest(`/invoices/${id}`),
        create: (data) => apiRequest('/invoices/create', { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => apiRequest(`/invoices/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
        send: (id) => apiRequest(`/invoices/${id}/send`, { method: 'PATCH' }),
        markAsPaid: (id) => apiRequest(`/invoices/${id}/pay`, { method: 'PATCH' }),
        delete: (id) => apiRequest(`/invoices/${id}`, { method: 'DELETE' }),
    },

    // Dashboard
    dashboard: {
        getStats: (period) => apiRequest(`/dashboard/stats?period=${period}`),
        getTransactions: () => apiRequest('/dashboard/transactions'),
        getCashFlow: (period) => apiRequest(`/dashboard/cash-flow?period=${period}`),
        getExpenses: (period) => apiRequest(`/dashboard/expenses?period=${period}`),
    },

    // Inventory / Products
    inventory: {
        getAll: (params) => apiRequest('/products?' + new URLSearchParams(params || {})),
        getOne: (id) => apiRequest(`/products/${id}`),
        create: (data) => apiRequest('/products', { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => apiRequest(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
        delete: (id) => apiRequest(`/products/${id}`, { method: 'DELETE' }),
        adjustStock: (id, data) => apiRequest(`/products/${id}/adjust`, { method: 'POST', body: JSON.stringify(data) }),
        getMovements: (id) => apiRequest(`/products/${id}/movements`),
        getStats: () => apiRequest('/products/stats'),
    },

    // Employees
    employees: {
        getAll: (params) => apiRequest('/employees?' + new URLSearchParams(params || {})),
        getOne: (id) => apiRequest(`/employees/${id}`),
        create: (data) => apiRequest('/employees', { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => apiRequest(`/employees/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
        delete: (id) => apiRequest(`/employees/${id}`, { method: 'DELETE' }),
        getPayrollHistory: (id) => apiRequest(`/employees/${id}/payroll`),
        getFinancialSnapshot: (id, year) => apiRequest(`/employees/${id}/financial-snapshot?year=${year}`),
    },

    // Payroll
    payroll: {
        getCurrentCycle: () => apiRequest('/payroll/current'),
        getHistory: (params) => apiRequest('/payroll/history?' + new URLSearchParams(params || {})),
        calculate: (data) => apiRequest('/payroll/calculate', { method: 'POST', body: JSON.stringify(data) }),
        submit: (data) => apiRequest('/payroll/submit', { method: 'POST', body: JSON.stringify(data) }),
        getStats: () => apiRequest('/payroll/stats'),
    },

    // Settings
    settings: {
        get: () => apiRequest('/settings'),
        update: (data) => apiRequest('/settings', { method: 'PATCH', body: JSON.stringify(data) }),
    },

    // Expenses
    expenses: {
        getAll: (params) => apiRequest('/expenses?' + new URLSearchParams(params || {})),
        getOne: (id) => apiRequest(`/expenses/${id}`),
        create: (data) => apiRequest('/expenses', { method: 'POST', body: JSON.stringify(data) }),
        update: (id, data) => apiRequest(`/expenses/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
        delete: (id) => apiRequest(`/expenses/${id}`, { method: 'DELETE' }),
    },
};
