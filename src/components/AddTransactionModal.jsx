import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { addTransaction, getCategories } from '../utils/storage';
import toast from 'react-hot-toast';
import './AddTransactionModal.css';

const AddTransactionModal = ({ type, onClose, onSuccess }) => {
    const { user } = useAuth();
    const [categories, setCategories] = useState({ income: [], expense: [] });
    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const cats = getCategories(user.id);
        setCategories(cats);
        if (type === 'income' && cats.income.length > 0) {
            setFormData(prev => ({ ...prev, category: cats.income[0].id }));
        } else if (type === 'expense' && cats.expense.length > 0) {
            setFormData(prev => ({ ...prev, category: cats.expense[0].id }));
        }
    }, [user, type]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || parseFloat(formData.amount) <= 0) {
            toast.error('Please enter a valid amount');
            return;
        }
        setLoading(true);
        try {
            addTransaction(user.id, {
                type,
                amount: parseFloat(formData.amount),
                category: formData.category,
                description: formData.description,
                date: formData.date
            });
            toast.success(`${type === 'income' ? 'Income' : 'Expense'} added!`);
            onSuccess();
        } catch (error) {
            toast.error('Failed to add transaction');
        }
        setLoading(false);
    };

    const currentCategories = type === 'income' ? categories.income : categories.expense;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content glass-card animate-slideUp" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add {type === 'income' ? 'Income' : 'Expense'}</h2>
                    <button className="modal-close" onClick={onClose}><X size={20} /></button>
                </div>
                <form className="modal-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Amount</label>
                        <div className="input-wrapper">
                            <DollarSign className="input-icon" size={18} />
                            <input type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="0.00" min="0" step="0.01" autoFocus />
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Category</label>
                        <div className="category-grid">
                            {currentCategories.map((cat) => (
                                <button key={cat.id} type="button" className={`category-btn ${formData.category === cat.id ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, category: cat.id })}
                                    style={{ '--cat-color': cat.color, borderColor: formData.category === cat.id ? cat.color : 'transparent' }}>
                                    <span className="cat-icon">{cat.icon}</span>
                                    <span className="cat-name">{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Date</label>
                        <div className="input-wrapper">
                            <Calendar className="input-icon" size={18} />
                            <input type="date" name="date" value={formData.date} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Description (Optional)</label>
                        <div className="input-wrapper">
                            <FileText className="input-icon" size={18} />
                            <input type="text" name="description" value={formData.description} onChange={handleChange} placeholder="Add a note..." />
                        </div>
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className={`btn ${type === 'income' ? 'btn-success' : 'btn-danger'}`} disabled={loading}>
                            {loading ? 'Saving...' : `Add ${type === 'income' ? 'Income' : 'Expense'}`}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddTransactionModal;
