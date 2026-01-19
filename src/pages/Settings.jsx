import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useBalance } from '../context/BalanceContext';
import { getSettings, saveSettings } from '../utils/storage';
import { Bell, DollarSign, Palette, Save, Check, RefreshCw, Shield, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import './Settings.css';

const Settings = () => {
    const { user } = useAuth();
    const { theme, setTheme } = useTheme();
    const { refreshSettings } = useBalance();
    const [settings, setSettings] = useState({
        currency: 'INR',
        currencySymbol: '₹',
        lowBalanceThreshold: 1000,
        alertsEnabled: true,
        theme: 'dark'
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const stgs = getSettings(user.id);
        setSettings({
            ...stgs,
            lowBalanceThreshold: Number(stgs.lowBalanceThreshold) || 1000
        });
    }, [user]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        let newValue = type === 'checkbox' ? checked : value;

        // Convert lowBalanceThreshold to number
        if (name === 'lowBalanceThreshold') {
            newValue = Number(value) || 0;
        }

        setSettings({
            ...settings,
            [name]: newValue
        });
    };

    const handleCurrencyChange = (e) => {
        const currency = e.target.value;
        const symbols = { INR: '₹', USD: '$', EUR: '€', GBP: '£', JPY: '¥', AUD: 'A$', CAD: 'C$' };
        setSettings({ ...settings, currency, currencySymbol: symbols[currency] || '₹' });
    };

    const handleThemeChange = (newTheme) => {
        setSettings({ ...settings, theme: newTheme });
        setTheme(newTheme);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Ensure threshold is a number
            const settingsToSave = {
                ...settings,
                lowBalanceThreshold: Number(settings.lowBalanceThreshold) || 1000
            };
            saveSettings(user.id, settingsToSave);
            refreshSettings();
            toast.success('Settings saved successfully!');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        const defaultSettings = {
            currency: 'INR',
            currencySymbol: '₹',
            lowBalanceThreshold: 1000,
            alertsEnabled: true,
            theme: 'dark'
        };
        setSettings(defaultSettings);
        setTheme('dark');
        toast.success('Settings reset to defaults');
    };

    return (
        <div className="settings-page">
            <div className="page-header animate-slideUp">
                <div>
                    <h1>Settings</h1>
                    <p>Customize your experience</p>
                </div>
                <button className="btn btn-ghost" onClick={handleReset}>
                    <RefreshCw size={18} />
                    Reset to Defaults
                </button>
            </div>

            <div className="settings-grid">
                {/* Currency Settings */}
                <div className="settings-card glass-card animate-slideUp" style={{ animationDelay: '0.1s' }}>
                    <div className="card-icon"><DollarSign size={24} /></div>
                    <h3>Currency Settings</h3>
                    <p className="card-description">Choose your preferred currency for transactions</p>
                    <div className="input-group">
                        <label>Currency</label>
                        <select name="currency" value={settings.currency} onChange={handleCurrencyChange}>
                            <option value="INR">🇮🇳 Indian Rupee (₹)</option>
                            <option value="USD">🇺🇸 US Dollar ($)</option>
                            <option value="EUR">🇪🇺 Euro (€)</option>
                            <option value="GBP">🇬🇧 British Pound (£)</option>
                            <option value="JPY">🇯🇵 Japanese Yen (¥)</option>
                            <option value="AUD">🇦🇺 Australian Dollar (A$)</option>
                            <option value="CAD">🇨🇦 Canadian Dollar (C$)</option>
                        </select>
                    </div>
                    <div className="currency-preview">
                        <span className="preview-label">Preview:</span>
                        <span className="preview-value">{settings.currencySymbol}10,000</span>
                    </div>
                </div>

                {/* Alert Settings */}
                <div className="settings-card glass-card animate-slideUp" style={{ animationDelay: '0.2s' }}>
                    <div className="card-icon"><Bell size={24} /></div>
                    <h3>Alert Settings</h3>
                    <p className="card-description">Get notified when your balance is low</p>
                    <div className="input-group">
                        <label>Low Balance Threshold</label>
                        <div className="threshold-input">
                            <span className="threshold-symbol">{settings.currencySymbol}</span>
                            <input
                                type="number"
                                name="lowBalanceThreshold"
                                value={settings.lowBalanceThreshold}
                                onChange={handleChange}
                                min="0"
                                step="100"
                            />
                        </div>
                        <span className="hint">
                            <Info size={12} />
                            You'll be alerted when balance falls below this amount
                        </span>
                    </div>
                    <div className="toggle-group">
                        <label className="toggle-label">
                            <input
                                type="checkbox"
                                name="alertsEnabled"
                                checked={settings.alertsEnabled}
                                onChange={handleChange}
                            />
                            <span className="toggle-slider"></span>
                            <span className="toggle-text">
                                <Shield size={16} />
                                Enable Low Balance Alerts
                            </span>
                        </label>
                        <span className={`status-badge ${settings.alertsEnabled ? 'active' : 'inactive'}`}>
                            {settings.alertsEnabled ? 'Active' : 'Disabled'}
                        </span>
                    </div>
                </div>

                {/* Appearance Settings */}
                <div className="settings-card glass-card animate-slideUp appearance-card" style={{ animationDelay: '0.3s' }}>
                    <div className="card-icon"><Palette size={24} /></div>
                    <h3>Appearance</h3>
                    <p className="card-description">Personalize the look and feel</p>
                    <div className="theme-options">
                        <button
                            className={`theme-btn dark-theme ${settings.theme === 'dark' ? 'active' : ''}`}
                            onClick={() => handleThemeChange('dark')}
                        >
                            <div className="theme-preview dark-preview">
                                <div className="preview-bar"></div>
                                <div className="preview-content">
                                    <div className="preview-sidebar"></div>
                                    <div className="preview-main"></div>
                                </div>
                            </div>
                            <div className="theme-info">
                                <span className="theme-name">🌙 Dark Mode</span>
                                <span className="theme-desc">Easy on the eyes</span>
                            </div>
                            {settings.theme === 'dark' && <Check size={18} className="theme-check" />}
                        </button>
                        <button
                            className={`theme-btn light-theme ${settings.theme === 'light' ? 'active' : ''}`}
                            onClick={() => handleThemeChange('light')}
                        >
                            <div className="theme-preview light-preview">
                                <div className="preview-bar"></div>
                                <div className="preview-content">
                                    <div className="preview-sidebar"></div>
                                    <div className="preview-main"></div>
                                </div>
                            </div>
                            <div className="theme-info">
                                <span className="theme-name">☀️ Light Mode</span>
                                <span className="theme-desc">Bright & clean</span>
                            </div>
                            {settings.theme === 'light' && <Check size={18} className="theme-check" />}
                        </button>
                    </div>
                </div>
            </div>

            <div className="settings-actions animate-slideUp" style={{ animationDelay: '0.4s' }}>
                <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                        <>
                            <div className="btn-spinner"></div>
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={20} />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Settings;

