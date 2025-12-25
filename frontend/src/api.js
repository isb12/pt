import axios from 'axios';

// Memory fallback for environments where localStorage is blocked
let memoryToken = null;

export const setToken = (token) => {
    memoryToken = token;
    try {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    } catch (e) {
        console.warn('LocalStorage access denied, using memory storage');
    }
};

export const getToken = () => {
    try {
        return localStorage.getItem('token') || memoryToken;
    } catch (e) {
        return memoryToken;
    }
};

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
});

api.interceptors.request.use(
    (config) => {
        const token = getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
