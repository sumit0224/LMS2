import React, { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check if user is logged in on mount
    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token');
            const role = localStorage.getItem('role'); // 'admin', 'user', 'teacher'

            if (token && role) {
                try {
                    // Determine existing role to hit correct profile endpoint
                    let endpoint = '';
                    if (role === 'admin') endpoint = '/admin/profile';
                    else if (role === 'user') endpoint = '/users/profile';
                    else if (role === 'teacher') endpoint = '/teachers/profile';

                    if (endpoint) {
                        const { data } = await api.get(endpoint);
                        setUser({ ...data, role });
                    }
                } catch (error) {
                    console.error("Auth check failed:", error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('role');
                }
            }
            setLoading(false);
        };

        checkLoggedIn();
    }, []);

    const login = async (email, password, role) => {
        let endpoint = '';
        if (role === 'admin') endpoint = '/admin/login';
        else if (role === 'user') endpoint = '/users/login';
        else if (role === 'teacher') endpoint = '/teachers/login';

        try {
            const { data } = await api.post(endpoint, { email, password });
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', role);

            // Fetch profile to get full user details
            // Or just set what we have if login response includes user info
            // The login response usually has { token, admin/user/teacher: {...} }
            // We can map it:
            const userData = data.admin || data.user || data.teacher;
            setUser({ ...userData, role });
            return { success: true };
        } catch (error) {
            console.error("Login failed:", error);
            return { success: false, error: error.response?.data?.message || "Login failed" };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
