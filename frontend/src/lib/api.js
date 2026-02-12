import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth APIs
export const authAPI = {
    register: (data) => api.post('/api/auth/register', data),
    login: (data) => api.post('/api/auth/login', data),
    getMe: () => api.get('/api/auth/me'),
    updateMe: (data) => api.put('/api/auth/me', data),
    forgotPassword: (data) => api.post('/api/auth/forgot-password', data),
    resetPassword: (data) => api.post('/api/auth/reset-password', data),
};

// User APIs
export const userAPI = {
    getByUsername: (username) => api.get(`/api/users/${username}`),
};

// Project APIs
export const projectAPI = {
    create: (data) => api.post('/api/projects', data),
    getAll: (params) => api.get('/api/projects', { params }),
    getMy: () => api.get('/api/projects/my'),
    getByUsername: (username) => api.get(`/api/projects/user/${username}`),
    getById: (id) => api.get(`/api/projects/${id}`),
    update: (id, data) => api.put(`/api/projects/${id}`, data),
    delete: (id) => api.delete(`/api/projects/${id}`),
};

export default api;
