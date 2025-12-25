import axios from 'axios';

let inMemoryToken: string | null = null;

const api = axios.create({
    baseURL: 'http://localhost:8000/api/v1',
});

api.interceptors.request.use((config) => {
    let token = inMemoryToken;
    if (!token) {
        try {
            token = localStorage.getItem('token');
        } catch (e) {
            console.warn('localStorage access denied');
        }
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const setToken = (token: string | null) => {
    inMemoryToken = token;
    if (token) {
        try {
            localStorage.setItem('token', token);
        } catch (e) {
            console.warn('localStorage access denied');
        }
    } else {
        try {
            localStorage.removeItem('token');
        } catch (e) {
            console.warn('localStorage access denied');
        }
    }
};

export default api;
