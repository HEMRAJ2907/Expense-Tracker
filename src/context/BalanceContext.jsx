import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getTransactions, getSettings, calculateBalance } from '../utils/storage';
import { useAuth } from './AuthContext';

const BalanceContext = createContext(null);

export const BalanceProvider = ({ children }) => {
    const { user } = useAuth();
    const [balance, setBalance] = useState(0);
    const [settings, setSettings] = useState({});
    const [lastUpdated, setLastUpdated] = useState(Date.now());

    const refreshBalance = useCallback(() => {
        if (user) {
            const transactions = getTransactions(user.id);
            const currentBalance = calculateBalance(transactions);
            setBalance(currentBalance);
            setLastUpdated(Date.now());
        }
    }, [user]);

    const refreshSettings = useCallback(() => {
        if (user) {
            const stgs = getSettings(user.id);
            setSettings(stgs);
        }
    }, [user]);

    const refresh = useCallback(() => {
        refreshBalance();
        refreshSettings();
    }, [refreshBalance, refreshSettings]);

    useEffect(() => {
        refresh();
    }, [user, refresh]);

    // Listen for storage changes (for multi-tab support)
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key?.includes('transactions') || e.key?.includes('settings')) {
                refresh();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [refresh]);

    const value = {
        balance,
        settings,
        lastUpdated,
        refreshBalance,
        refreshSettings,
        refresh
    };

    return (
        <BalanceContext.Provider value={value}>
            {children}
        </BalanceContext.Provider>
    );
};

export const useBalance = () => {
    const context = useContext(BalanceContext);
    if (!context) {
        throw new Error('useBalance must be used within a BalanceProvider');
    }
    return context;
};
