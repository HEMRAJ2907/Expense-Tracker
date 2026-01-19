import React, { useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { BalanceProvider } from './context/BalanceContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Layout from './components/Layout';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Public Route Component (redirects if already logged in)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="spinner"></div>
                <p>Loading...</p>
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

// Toaster with theme support
const ThemedToaster = () => {
    const { isDark } = useTheme();

    const toastOptions = useMemo(() => ({
        duration: 3000,
        style: {
            background: isDark ? '#1a1a2e' : '#ffffff',
            color: isDark ? '#fff' : '#1a1a2e',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
            borderRadius: '12px',
            boxShadow: isDark
                ? '0 10px 40px rgba(0, 0, 0, 0.3)'
                : '0 10px 40px rgba(0, 0, 0, 0.1)',
        },
        success: {
            iconTheme: {
                primary: '#38ef7d',
                secondary: isDark ? '#1a1a2e' : '#ffffff',
            },
        },
        error: {
            iconTheme: {
                primary: '#f45c43',
                secondary: isDark ? '#1a1a2e' : '#ffffff',
            },
        },
    }), [isDark]);

    return <Toaster position="top-right" toastOptions={toastOptions} />;
};

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/login" element={
                <PublicRoute>
                    <Login />
                </PublicRoute>
            } />

            <Route path="/register" element={
                <PublicRoute>
                    <Register />
                </PublicRoute>
            } />

            <Route path="/dashboard" element={
                <ProtectedRoute>
                    <Layout>
                        <Dashboard />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/transactions" element={
                <ProtectedRoute>
                    <Layout>
                        <Transactions />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/reports" element={
                <ProtectedRoute>
                    <Layout>
                        <Reports />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="/settings" element={
                <ProtectedRoute>
                    <Layout>
                        <Settings />
                    </Layout>
                </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}

function AppContent() {
    return (
        <ThemeProvider>
            <BalanceProvider>
                <ThemedToaster />
                <AppRoutes />
            </BalanceProvider>
        </ThemeProvider>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;

