import React, { createContext, useState, useContext, useEffect } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currency, setCurrencyState] = useState(localStorage.getItem('app_currency') || 'USD');

    const setCurrency = (curr) => {
        setCurrencyState(curr);
        localStorage.setItem('app_currency', curr);
    };

    const formatCurrency = (amount) => {
        const symbolMap = { USD: '$', EUR: '€', GBP: '£', NGN: '₦' };
        const sym = symbolMap[currency] || '$';
        return `${sym}${Number(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            // Validate token and get user profile
            api.auth.getProfile()
                .then(data => {
                    setUser(data);
                })
                .catch(() => {
                    localStorage.removeItem('token');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email, password) => {
        const data = await api.auth.login({ email, password });
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return data;
    };

    const register = async (userData) => {
        const data = await api.auth.register(userData);
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, currency, setCurrency, formatCurrency }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
