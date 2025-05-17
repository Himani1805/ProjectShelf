import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

// Add a method to check auth status
api.checkAuthStatus = async () => {
    try {
        await api.get('/api/users/me');
        return true;
    } catch (error) {
        if (error.response?.status === 401) {
            // Try to refresh the token
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                const response = await api.post('/api/users/refresh-token', { refreshToken });
                const { token } = response.data;

                if (token) {
                    localStorage.setItem('token', token);
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    return true;
                }
            } catch (refreshError) {
                // Clear tokens if refresh failed
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                delete api.defaults.headers.common['Authorization'];
                return false;
            }
        }
        return false;
    }
};

// Add request interceptor
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If there's no response or it's a network error
        if (!error.response) {
            return Promise.reject({
                response: {
                    status: 0,
                    data: { message: 'Network error. Please check your connection.' }
                }
            });
        }

        // Handle 401 Unauthorized errors
        if (error.response.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                try {
                    // Wait for the other refresh request to complete
                    const token = await new Promise((resolve, reject) => {
                        failedQueue.push({ resolve, reject });
                    });
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    return api(originalRequest);
                } catch (err) {
                    // If waiting for refresh fails, throw a custom error
                    throw {
                        response: {
                            status: 401,
                            data: { message: 'Session expired. Please log in again.' }
                        }
                    };
                }
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                const response = await api.post('/api/users/refresh-token', { refreshToken });
                const { token } = response.data;

                if (token) {
                    localStorage.setItem('token', token);
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    originalRequest.headers['Authorization'] = `Bearer ${token}`;
                    processQueue(null, token);
                    return api(originalRequest);
                } else {
                    throw new Error('No token in refresh response');
                }
            } catch (refreshError) {
                processQueue(refreshError, null);
                // Clear tokens if refresh failed
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                delete api.defaults.headers.common['Authorization'];
                
                // Throw a custom error for session expiration
                throw {
                    response: {
                        status: 401,
                        data: { message: 'Session expired. Please log in again.' }
                    }
                };
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// Initialize token from localStorage if it exists
const token = localStorage.getItem('token');
if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

export default api;