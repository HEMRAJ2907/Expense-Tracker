import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBalance } from '../context/BalanceContext';
import { useTheme } from '../context/ThemeContext';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    Target,
    Sparkles
} from 'lucide-react';
import {
    getTransactions,
    getSettings,
    getCategories,
    calculateBalance,
    calculateTotalIncome,
    calculateTotalExpense,
    getMonthlyData
} from '../utils/storage';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import AddTransactionModal from '../components/AddTransactionModal';
import './Dashboard.css';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const Dashboard = () => {
    const { user } = useAuth();
    const { refresh: refreshBalance } = useBalance();
    const { isDark } = useTheme();
    const [transactions, setTransactions] = useState([]);
    const [settings, setSettings] = useState({});
    const [categories, setCategories] = useState({ income: [], expense: [] });
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('expense');

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = () => {
        const txns = getTransactions(user.id);
        const stgs = getSettings(user.id);
        const cats = getCategories(user.id);
        setTransactions(txns);
        setSettings(stgs);
        setCategories(cats);
    };

    const balance = calculateBalance(transactions);
    const totalIncome = calculateTotalIncome(transactions);
    const totalExpense = calculateTotalExpense(transactions);
    const monthlyData = getMonthlyData(transactions, 6);

    // Get current month transactions
    const currentDate = new Date();
    const currentMonthTxns = transactions.filter(t => {
        const txnDate = new Date(t.date);
        return txnDate.getMonth() === currentDate.getMonth() &&
            txnDate.getFullYear() === currentDate.getFullYear();
    });

    const currentMonthIncome = calculateTotalIncome(currentMonthTxns);
    const currentMonthExpense = calculateTotalExpense(currentMonthTxns);

    // Get recent transactions (last 5)
    const recentTransactions = transactions.slice(0, 5);

    // Category breakdown for expenses
    const expenseByCategory = {};
    currentMonthTxns
        .filter(t => t.type === 'expense')
        .forEach(t => {
            if (!expenseByCategory[t.category]) {
                expenseByCategory[t.category] = 0;
            }
            expenseByCategory[t.category] += t.amount;
        });

    const getCategoryInfo = (categoryId, type) => {
        const cats = type === 'income' ? categories.income : categories.expense;
        return cats.find(c => c.id === categoryId) || { name: categoryId, icon: '📦', color: '#a0aec0' };
    };

    // Theme-aware chart colors
    const chartColors = {
        income: {
            border: isDark ? '#38ef7d' : '#059669',
            background: isDark ? 'rgba(56, 239, 125, 0.15)' : 'rgba(5, 150, 105, 0.15)',
        },
        expense: {
            border: isDark ? '#f45c43' : '#dc2626',
            background: isDark ? 'rgba(244, 92, 67, 0.15)' : 'rgba(220, 38, 38, 0.15)',
        },
        grid: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.08)',
        text: isDark ? '#a0aec0' : '#4a5568',
        textMuted: isDark ? '#718096' : '#64748b',
        tooltip: {
            bg: isDark ? '#1a1a2e' : '#ffffff',
            title: isDark ? '#ffffff' : '#1a1a2e',
            body: isDark ? '#a0aec0' : '#4a5568',
            border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        },
        doughnutBorder: isDark ? '#1a1a2e' : '#ffffff',
    };

    // Chart configurations with theme support
    const lineChartData = {
        labels: monthlyData.map(d => d.month),
        datasets: [
            {
                label: 'Income',
                data: monthlyData.map(d => d.income),
                borderColor: chartColors.income.border,
                backgroundColor: chartColors.income.background,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: chartColors.income.border,
                pointBorderColor: chartColors.income.border,
                pointHoverRadius: 8,
                pointRadius: 4,
                borderWidth: 3,
            },
            {
                label: 'Expense',
                data: monthlyData.map(d => d.expense),
                borderColor: chartColors.expense.border,
                backgroundColor: chartColors.expense.background,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: chartColors.expense.border,
                pointBorderColor: chartColors.expense.border,
                pointHoverRadius: 8,
                pointRadius: 4,
                borderWidth: 3,
            }
        ]
    };

    const lineChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: chartColors.text,
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 13,
                        weight: '600'
                    }
                }
            },
            tooltip: {
                backgroundColor: chartColors.tooltip.bg,
                titleColor: chartColors.tooltip.title,
                bodyColor: chartColors.tooltip.body,
                borderColor: chartColors.tooltip.border,
                borderWidth: 1,
                padding: 14,
                cornerRadius: 10,
                titleFont: { size: 14, weight: '600' },
                bodyFont: { size: 13 },
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                callbacks: {
                    label: (context) => `${context.dataset.label}: ${settings.currencySymbol}${context.parsed.y.toLocaleString()}`
                }
            }
        },
        scales: {
            x: {
                grid: {
                    color: chartColors.grid,
                    drawBorder: false
                },
                ticks: {
                    color: chartColors.textMuted,
                    font: { size: 12 }
                }
            },
            y: {
                grid: {
                    color: chartColors.grid,
                    drawBorder: false
                },
                ticks: {
                    color: chartColors.textMuted,
                    font: { size: 12 },
                    callback: (value) => `${settings.currencySymbol}${value.toLocaleString()}`
                }
            }
        }
    };

    const doughnutData = {
        labels: Object.keys(expenseByCategory).map(id => getCategoryInfo(id, 'expense').name),
        datasets: [{
            data: Object.values(expenseByCategory),
            backgroundColor: Object.keys(expenseByCategory).map(id => getCategoryInfo(id, 'expense').color),
            borderColor: chartColors.doughnutBorder,
            borderWidth: 4,
            hoverOffset: 10,
            hoverBorderWidth: 2,
        }]
    };

    const doughnutOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
            legend: {
                position: 'right',
                labels: {
                    color: chartColors.text,
                    usePointStyle: true,
                    padding: 18,
                    font: {
                        size: 12,
                        weight: '500'
                    }
                }
            },
            tooltip: {
                backgroundColor: chartColors.tooltip.bg,
                titleColor: chartColors.tooltip.title,
                bodyColor: chartColors.tooltip.body,
                borderColor: chartColors.tooltip.border,
                borderWidth: 1,
                padding: 14,
                cornerRadius: 10,
                titleFont: { size: 14, weight: '600' },
                bodyFont: { size: 13 },
                callbacks: {
                    label: (context) => `${context.label}: ${settings.currencySymbol}${context.raw.toLocaleString()}`
                }
            }
        }
    };

    const handleAddTransaction = (type) => {
        setModalType(type);
        setShowModal(true);
    };

    const handleTransactionAdded = () => {
        loadData();
        refreshBalance(); // Update header balance
        setShowModal(false);
    };

    const formatCurrency = (amount) => {
        return `${settings.currencySymbol || '₹'}${amount.toLocaleString('en-IN')}`;
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short'
        });
    };

    return (
        <div className="dashboard">
            {/* Header */}
            <div className="dashboard-header animate-slideUp">
                <div className="welcome-section">
                    <h1>Welcome back, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>!</h1>
                    <p>Here's your financial overview</p>
                </div>
                <div className="header-actions">
                    <button
                        className="btn btn-success"
                        onClick={() => handleAddTransaction('income')}
                    >
                        <Plus size={18} />
                        Add Income
                    </button>
                    <button
                        className="btn btn-danger"
                        onClick={() => handleAddTransaction('expense')}
                    >
                        <Plus size={18} />
                        Add Expense
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card balance-card glass-card animate-slideUp" style={{ animationDelay: '0.1s' }}>
                    <div className="stat-icon balance-icon">
                        <Wallet size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Balance</span>
                        <span className={`stat-value ${balance < 0 ? 'negative' : ''}`}>
                            {formatCurrency(balance)}
                        </span>
                        {balance < settings.lowBalanceThreshold && (
                            <span className="stat-warning">Below threshold</span>
                        )}
                    </div>
                </div>

                <div className="stat-card income-card glass-card animate-slideUp" style={{ animationDelay: '0.2s' }}>
                    <div className="stat-icon income-icon">
                        <TrendingUp size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Income</span>
                        <span className="stat-value income">{formatCurrency(totalIncome)}</span>
                        <span className="stat-subtitle">
                            <ArrowUpRight size={14} />
                            This month: {formatCurrency(currentMonthIncome)}
                        </span>
                    </div>
                </div>

                <div className="stat-card expense-card glass-card animate-slideUp" style={{ animationDelay: '0.3s' }}>
                    <div className="stat-icon expense-icon">
                        <TrendingDown size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Total Expenses</span>
                        <span className="stat-value expense">{formatCurrency(totalExpense)}</span>
                        <span className="stat-subtitle">
                            <ArrowDownRight size={14} />
                            This month: {formatCurrency(currentMonthExpense)}
                        </span>
                    </div>
                </div>

                <div className="stat-card savings-card glass-card animate-slideUp" style={{ animationDelay: '0.4s' }}>
                    <div className="stat-icon savings-icon">
                        <Target size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-label">Savings Rate</span>
                        <span className="stat-value">
                            {totalIncome > 0 ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100) : 0}%
                        </span>
                        <span className="stat-subtitle">
                            Of total income saved
                        </span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-grid">
                <div className="chart-card glass-card animate-slideUp" style={{ animationDelay: '0.5s' }}>
                    <div className="chart-header">
                        <h3>Income vs Expenses</h3>
                        <span className="chart-subtitle">Last 6 months</span>
                    </div>
                    <div className="chart-container line-chart">
                        <Line data={lineChartData} options={lineChartOptions} />
                    </div>
                </div>

                <div className="chart-card glass-card animate-slideUp" style={{ animationDelay: '0.6s' }}>
                    <div className="chart-header">
                        <h3>Expense Breakdown</h3>
                        <span className="chart-subtitle">This month</span>
                    </div>
                    <div className="chart-container doughnut-chart">
                        {Object.keys(expenseByCategory).length > 0 ? (
                            <Doughnut data={doughnutData} options={doughnutOptions} />
                        ) : (
                            <div className="no-data">
                                <p>No expenses this month</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Transactions */}
            <div className="recent-transactions glass-card animate-slideUp" style={{ animationDelay: '0.7s' }}>
                <div className="section-header">
                    <h3>Recent Transactions</h3>
                    <Link to="/transactions" className="view-all-link">
                        View All →
                    </Link>
                </div>

                {recentTransactions.length > 0 ? (
                    <div className="transactions-list">
                        {recentTransactions.map((txn) => {
                            const category = getCategoryInfo(txn.category, txn.type);
                            return (
                                <div key={txn.id} className="transaction-item">
                                    <div className="txn-icon" style={{ background: `${category.color}20` }}>
                                        <span>{category.icon}</span>
                                    </div>
                                    <div className="txn-details">
                                        <span className="txn-title">{txn.description || category.name}</span>
                                        <span className="txn-category">{category.name}</span>
                                    </div>
                                    <div className="txn-meta">
                                        <span className={`txn-amount ${txn.type}`}>
                                            {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                                        </span>
                                        <span className="txn-date">{formatDate(txn.date)}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="no-transactions">
                        <p>No transactions yet. Start by adding your first income or expense!</p>
                    </div>
                )}
            </div>

            {/* Add Transaction Modal */}
            {showModal && (
                <AddTransactionModal
                    type={modalType}
                    onClose={() => setShowModal(false)}
                    onSuccess={handleTransactionAdded}
                />
            )}
        </div>
    );
};

export default Dashboard;
