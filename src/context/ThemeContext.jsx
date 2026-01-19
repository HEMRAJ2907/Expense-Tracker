import React, { createContext, useContext, useState, useEffect, useLayoutEffect } from 'react';
import { getSettings } from '../utils/storage';
import { useAuth } from './AuthContext';

const ThemeContext = createContext(null);

// Apply theme immediately to prevent flash
const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
};

// Initialize with dark theme immediately
applyTheme('dark');

export const ThemeProvider = ({ children }) => {
    const { user } = useAuth();
    const [theme, setTheme] = useState('dark');
    const [mounted, setMounted] = useState(false);

    // Use layoutEffect to apply theme before paint
    useLayoutEffect(() => {
        // Always start with dark mode
        applyTheme('dark');
        setTheme('dark');

        // If user is logged in, check their saved preference
        if (user) {
            const settings = getSettings(user.id);
            const savedTheme = settings.theme || 'dark';
            setTheme(savedTheme);
            applyTheme(savedTheme);
        }

        setMounted(true);
    }, [user]);

    useEffect(() => {
        // Apply theme to document whenever it changes
        applyTheme(theme);

        // Save to localStorage for persistence
        localStorage.setItem('expense_tracker_theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const value = {
        theme,
        setTheme,
        toggleTheme,
        isDark: theme === 'dark'
    };

    // Prevent flash of unstyled content
    if (!mounted) {
        return null;
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

