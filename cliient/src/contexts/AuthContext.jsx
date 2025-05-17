import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchUserProfile(token);
        } else {
            setLoading(false);
        }
    }, []);

    const fetchUserProfile = async (token) => {
        try {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            const response = await api.get('/api/users/me');
            setCurrentUser(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            // Try to refresh the token before removing it
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const response = await api.post('/api/users/refresh-token', { refreshToken });
                    if (response.data.token) {
                        localStorage.setItem('token', response.data.token);
                        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                        await fetchUserProfile(response.data.token);
                        return;
                    }
                } catch (refreshError) {
                    console.error('Error refreshing token:', refreshError);
                }
            }
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            setError(null);
            const response = await api.post('/api/users/login', { email, password });
            const { token, refreshToken, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setCurrentUser(user);

            // Get redirect path from localStorage if it exists, otherwise go to dashboard
            const redirectPath = localStorage.getItem('redirectPath') || '/dashboard';
            localStorage.removeItem('redirectPath'); // Clear after use
            navigate(redirectPath);

            return user;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            const response = await api.post('/api/users/register', userData);
            const { token, refreshToken, user } = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('refreshToken', refreshToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            setCurrentUser(user);

            // Get redirect path from localStorage if it exists, otherwise go to dashboard
            const redirectPath = localStorage.getItem('redirectPath') || '/dashboard';
            localStorage.removeItem('redirectPath'); // Clear after use
            navigate(redirectPath);

            return user;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Registration failed';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        delete api.defaults.headers.common['Authorization'];
        setCurrentUser(null);
        navigate('/login');
    };

    const updateProfile = async (profileData) => {
        try {
            const response = await api.put('/api/users/profile', profileData);
            setCurrentUser(response.data);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Profile update failed';
            setError(errorMessage);
            throw error;
        }
    };

    const value = {
        currentUser,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};