import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getTransactions, getSettings, getCategories, calculateTotalIncome, calculateTotalExpense, getMonthlyData, getTransactionsByCategory } from '../utils/storage';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import './Reports.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const Reports = () => {
    const { user } = useAuth();
    const { isDark } = useTheme();
    const [transactions, setTransactions] = useState([]);
    const [settings, setSettings] = useState({});
    const [categories, setCategories] = useState({ income: [], expense: [] });
    const [period, setPeriod] = useState('6');

    useEffect(() => {
        const txns = getTransactions(user.id);
        const stgs = getSettings(user.id);
        const cats = getCategories(user.id);
        setTransactions(txns);
        setSettings(stgs);
        setCategories(cats);
    }, [user]);

    const monthlyData = getMonthlyData(transactions, parseInt(period));
    const totalIncome = calculateTotalIncome(transactions);
    const totalExpense = calculateTotalExpense(transactions);
    const expenseByCategory = getTransactionsByCategory(transactions, 'expense');
    const incomeByCategory = getTransactionsByCategory(transactions, 'income');

    const getCategoryInfo = (id, type) => {
        const cats = type === 'income' ? categories.income : categories.expense;
        return cats.find(c => c.id === id) || { name: id, color: '#a0aec0' };
    };

    // Theme-aware chart colors
    const chartColors = {
        income: isDark ? 'rgba(56, 239, 125, 0.85)' : 'rgba(5, 150, 105, 0.85)',
        expense: isDark ? 'rgba(244, 92, 67, 0.85)' : 'rgba(220, 38, 38, 0.85)',
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

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: chartColors.text,
                    usePointStyle: true,
                    padding: 16,
                    font: { size: 12, weight: '500' }
                }
            },
            tooltip: {
                backgroundColor: chartColors.tooltip.bg,
                titleColor: chartColors.tooltip.title,
                bodyColor: chartColors.tooltip.body,
                borderColor: chartColors.tooltip.border,
                borderWidth: 1,
                padding: 12,
                cornerRadius: 8,
            }
        },
        scales: {
            x: {
                grid: { color: chartColors.grid, drawBorder: false },
                ticks: { color: chartColors.textMuted, font: { size: 11 } }
            },
            y: {
                grid: { color: chartColors.grid, drawBorder: false },
                ticks: { color: chartColors.textMuted, font: { size: 11 } }
            }
        }
    };

    const barData = {
        labels: monthlyData.map(d => d.month),
        datasets: [
            {
                label: 'Income',
                data: monthlyData.map(d => d.income),
                backgroundColor: chartColors.income,
                borderRadius: 8,
                borderSkipped: false
            },
            {
                label: 'Expense',
                data: monthlyData.map(d => d.expense),
                backgroundColor: chartColors.expense,
                borderRadius: 8,
                borderSkipped: false
            }
        ]
    };

    const expenseDoughnutData = {
        labels: Object.keys(expenseByCategory).map(id => getCategoryInfo(id, 'expense').name),
        datasets: [{
            data: Object.values(expenseByCategory),
            backgroundColor: Object.keys(expenseByCategory).map(id => getCategoryInfo(id, 'expense').color),
            borderColor: chartColors.doughnutBorder,
            borderWidth: 3,
            hoverOffset: 8
        }]
    };

    const incomeDoughnutData = {
        labels: Object.keys(incomeByCategory).map(id => getCategoryInfo(id, 'income').name),
        datasets: [{
            data: Object.values(incomeByCategory),
            backgroundColor: Object.keys(incomeByCategory).map(id => getCategoryInfo(id, 'income').color),
            borderColor: chartColors.doughnutBorder,
            borderWidth: 3,
            hoverOffset: 8
        }]
    };

    const doughnutOptions = {
        ...chartOptions,
        cutout: '65%',
        scales: undefined // Remove scales for doughnut chart
    };

    const formatCurrency = (amt) => `${settings.currencySymbol || '₹'}${amt.toLocaleString('en-IN')}`;

    return (
        <div className="reports-page">
            <div className="page-header animate-slideUp">
                <div><h1>Reports</h1><p>Analyze your financial data</p></div>
                <select value={period} onChange={(e) => setPeriod(e.target.value)} className="period-select">
                    <option value="3">Last 3 months</option>
                    <option value="6">Last 6 months</option>
                    <option value="12">Last 12 months</option>
                </select>
            </div>

            <div className="summary-cards">
                <div className="summary-card glass-card"><h3>Total Income</h3><p className="income">{formatCurrency(totalIncome)}</p></div>
                <div className="summary-card glass-card"><h3>Total Expenses</h3><p className="expense">{formatCurrency(totalExpense)}</p></div>
                <div className="summary-card glass-card"><h3>Net Savings</h3><p className={totalIncome - totalExpense >= 0 ? 'income' : 'expense'}>{formatCurrency(totalIncome - totalExpense)}</p></div>
                <div className="summary-card glass-card"><h3>Transactions</h3><p>{transactions.length}</p></div>
            </div>

            <div className="charts-section">
                <div className="chart-card glass-card animate-slideUp"><h3>Monthly Comparison</h3><div className="chart-container"><Bar data={barData} options={chartOptions} /></div></div>
            </div>

            <div className="charts-grid">
                <div className="chart-card glass-card animate-slideUp">
                    <h3>Expense by Category</h3>
                    <div className="chart-container doughnut">{Object.keys(expenseByCategory).length > 0 ? <Doughnut data={expenseDoughnutData} options={doughnutOptions} /> : <p className="no-data">No expense data</p>}</div>
                </div>
                <div className="chart-card glass-card animate-slideUp">
                    <h3>Income by Category</h3>
                    <div className="chart-container doughnut">{Object.keys(incomeByCategory).length > 0 ? <Doughnut data={incomeDoughnutData} options={doughnutOptions} /> : <p className="no-data">No income data</p>}</div>
                </div>
            </div>
        </div>
    );
};

export default Reports;

