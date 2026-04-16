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
        const value = Number(amount || 0);
        try {
            return new Intl.NumberFormat(undefined, {
                style: 'currency',
                currency,
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }).format(value);
        } catch {
            return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        }
    };

    useEffect(() => {
        // Try restoring an existing cookie session on app load.
        api.auth.getProfile()
            .then(data => {
                setUser(data);
            })
            .catch(() => {
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const login = async (email, password) => {
        const data = await api.auth.login({ email, password });
        setUser(data.user);
        return data;
    };

    const register = async (userData) => {
        const data = await api.auth.register(userData);
        setUser(data.user);
        return data;
    };

    const logout = async () => {
        await api.auth.logout().catch(() => null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, currency, setCurrency, formatCurrency }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);


