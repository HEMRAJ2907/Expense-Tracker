import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBalance } from '../context/BalanceContext';
import { useTheme } from '../context/ThemeContext';
import {
    LayoutDashboard,
    Receipt,
    PieChart,
    Settings,
    LogOut,
    Menu,
    X,
    Wallet,
    ChevronDown,
    User,
    AlertTriangle,
    Sun,
    Moon
} from 'lucide-react';
import toast from 'react-hot-toast';
import './Layout.css';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const { balance, settings, refresh } = useBalance();
    const { theme, toggleTheme, isDark } = useTheme();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [alertDismissed, setAlertDismissed] = useState(false);
    const userMenuRef = useRef(null);

    // Refresh balance when component mounts and periodically
    useEffect(() => {
        refresh();

        // Set up interval to refresh balance every 2 seconds
        const interval = setInterval(() => {
            refresh();
        }, 2000);

        return () => clearInterval(interval);
    }, [refresh]);

    // Check for low balance alert
    useEffect(() => {
        if (user && settings && !alertDismissed) {
            const threshold = Number(settings.lowBalanceThreshold) || 1000;
            const alertsEnabled = settings.alertsEnabled !== false;

            if (alertsEnabled && balance < threshold) {
                setShowAlert(true);
            } else {
                setShowAlert(false);
            }
        }
    }, [user, balance, settings, alertDismissed]);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        toast.success('Logged out successfully');
        navigate('/login');
    };

    const handleDismissAlert = () => {
        setShowAlert(false);
        setAlertDismissed(true);
    };

    const navItems = [
        { path: '/dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { path: '/transactions', name: 'Transactions', icon: Receipt },
        { path: '/reports', name: 'Reports', icon: PieChart },
        { path: '/settings', name: 'Settings', icon: Settings },
    ];

    const formatCurrency = (amount) => `${settings?.currencySymbol || '₹'}${amount.toLocaleString('en-IN')}`;

    return (
        <div className="layout">
            {/* Top Header Bar */}
            <header className="top-header">
                <div className="header-left">
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                    >
                        {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                    </button>
                    <div className="header-logo">
                        <div className="logo-icon-wrapper">
                            <Wallet size={22} />
                        </div>
                        <span className="logo-text">ExpenseTracker<span className="logo-pro">Pro</span></span>
                    </div>
                </div>

                <div className="header-right">
                    <div className="balance-display">
                        <span className="balance-label">Balance</span>
                        <span className={`balance-amount ${balance < 0 ? 'negative' : ''}`}>
                            {formatCurrency(balance)}
                        </span>
                    </div>

                    {/* Theme Toggle Button */}
                    <button
                        className="theme-toggle-btn"
                        onClick={toggleTheme}
                        aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
                        title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
                    >
                        <div className="theme-toggle-track">
                            <div className={`theme-toggle-thumb ${isDark ? 'dark' : 'light'}`}>
                                {isDark ? <Moon size={14} /> : <Sun size={14} />}
                            </div>
                        </div>
                    </button>

                    <div className="user-menu-container" ref={userMenuRef}>
                        <button
                            className="user-menu-trigger"
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <div className="user-avatar-small">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <span className="user-name-header">{user?.name?.split(' ')[0] || 'User'}</span>
                            <ChevronDown size={16} className={`chevron ${showUserMenu ? 'rotate' : ''}`} />
                        </button>

                        {showUserMenu && (
                            <div className="user-dropdown animate-fadeIn">
                                <div className="dropdown-header">
                                    <div className="dropdown-avatar">
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div className="dropdown-user-info">
                                        <span className="dropdown-name">{user?.name}</span>
                                        <span className="dropdown-email">{user?.email}</span>
                                    </div>
                                </div>
                                <div className="dropdown-divider"></div>
                                <NavLink to="/settings" className="dropdown-item" onClick={() => setShowUserMenu(false)}>
                                    <User size={16} />
                                    <span>Settings</span>
                                </NavLink>
                                <button className="dropdown-item logout" onClick={handleLogout}>
                                    <LogOut size={16} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `nav-link ${isActive ? 'active' : ''}`
                            }
                            onClick={() => setSidebarOpen(false)}
                        >
                            <item.icon size={20} />
                            <span>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="main-content">
                {/* Low Balance Alert */}
                {showAlert && (
                    <div className="low-balance-alert animate-slideUp">
                        <AlertTriangle size={20} />
                        <span>
                            <strong>Low Balance Alert!</strong> Your balance ({formatCurrency(balance)}) is below {formatCurrency(Number(settings?.lowBalanceThreshold) || 1000)}.
                        </span>
                        <button
                            className="alert-close"
                            onClick={handleDismissAlert}
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {children}
            </main>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default Layout;

