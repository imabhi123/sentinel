import axios from 'axios';

const API_URL = 'https://960wd305-5001.inc1.devtunnels.ms/api/auth';

export const signup = async (email, password, name) => {
    const response = await axios.post(`${API_URL}/signup`, { email, password, name });
    return response.data;
};

export const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};
