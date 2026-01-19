import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBalance } from '../context/BalanceContext';
import { Plus, Search, Filter, Trash2, Edit2, Download } from 'lucide-react';
import { getTransactions, deleteTransaction, getCategories, getSettings } from '../utils/storage';
import AddTransactionModal from '../components/AddTransactionModal';
import toast from 'react-hot-toast';
import './Transactions.css';

const Transactions = () => {
    const { user } = useAuth();
    const { refresh: refreshBalance } = useBalance();
    const [transactions, setTransactions] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [categories, setCategories] = useState({ income: [], expense: [] });
    const [settings, setSettings] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState('expense');
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [filterCategory, setFilterCategory] = useState('all');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });

    useEffect(() => {
        loadData();
    }, [user]);

    useEffect(() => {
        applyFilters();
    }, [transactions, search, filterType, filterCategory, dateRange]);

    const loadData = () => {
        const txns = getTransactions(user.id);
        const cats = getCategories(user.id);
        const stgs = getSettings(user.id);
        setTransactions(txns);
        setCategories(cats);
        setSettings(stgs);
    };

    const applyFilters = () => {
        let result = [...transactions];
        if (search) {
            result = result.filter(t =>
                t.description?.toLowerCase().includes(search.toLowerCase()) ||
                getCategoryInfo(t.category, t.type).name.toLowerCase().includes(search.toLowerCase())
            );
        }
        if (filterType !== 'all') {
            result = result.filter(t => t.type === filterType);
        }
        if (filterCategory !== 'all') {
            result = result.filter(t => t.category === filterCategory);
        }
        if (dateRange.start) {
            result = result.filter(t => t.date >= dateRange.start);
        }
        if (dateRange.end) {
            result = result.filter(t => t.date <= dateRange.end);
        }
        setFiltered(result);
    };

    const getCategoryInfo = (categoryId, type) => {
        const cats = type === 'income' ? categories.income : categories.expense;
        return cats.find(c => c.id === categoryId) || { name: categoryId, icon: '📦', color: '#a0aec0' };
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            deleteTransaction(user.id, id);
            loadData();
            refreshBalance(); // Update header balance
            toast.success('Transaction deleted');
        }
    };

    const formatCurrency = (amount) => `${settings.currencySymbol || '₹'}${amount.toLocaleString('en-IN')}`;
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    const handleAddTransaction = (type) => {
        setModalType(type);
        setShowModal(true);
    };

    const allCategories = [...categories.income, ...categories.expense];

    return (
        <div className="transactions-page">
            <div className="page-header animate-slideUp">
                <div>
                    <h1>Transactions</h1>
                    <p>Manage all your income and expenses</p>
                </div>
                <div className="header-actions">
                    <button className="btn btn-success" onClick={() => handleAddTransaction('income')}><Plus size={18} />Income</button>
                    <button className="btn btn-danger" onClick={() => handleAddTransaction('expense')}><Plus size={18} />Expense</button>
                </div>
            </div>

            <div className="filters-section glass-card animate-slideUp">
                <div className="search-box">
                    <Search size={18} />
                    <input type="text" placeholder="Search transactions..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="filter-group">
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="all">All Types</option>
                        <option value="income">Income</option>
                        <option value="expense">Expense</option>
                    </select>
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                        <option value="all">All Categories</option>
                        {allCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>)}
                    </select>
                    <input type="date" placeholder="From" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
                    <input type="date" placeholder="To" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
                </div>
            </div>

            <div className="transactions-table glass-card animate-slideUp">
                {filtered.length > 0 ? (
                    <table>
                        <thead>
                            <tr>
                                <th>Category</th>
                                <th>Description</th>
                                <th>Date</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((txn) => {
                                const cat = getCategoryInfo(txn.category, txn.type);
                                return (
                                    <tr key={txn.id}>
                                        <td>
                                            <div className="cat-cell">
                                                <span className="cat-icon" style={{ background: `${cat.color}20` }}>{cat.icon}</span>
                                                <span>{cat.name}</span>
                                            </div>
                                        </td>
                                        <td>{txn.description || '-'}</td>
                                        <td>{formatDate(txn.date)}</td>
                                        <td><span className={`amount ${txn.type}`}>{txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}</span></td>
                                        <td>
                                            <button className="action-btn delete" onClick={() => handleDelete(txn.id)}><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className="no-data"><p>No transactions found</p></div>
                )}
            </div>

            {showModal && (
                <AddTransactionModal
                    type={modalType}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => {
                        loadData();
                        refreshBalance(); // Update header balance
                        setShowModal(false);
                    }}
                />
            )}
        </div>
    );
};

export default Transactions;
