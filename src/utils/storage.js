// LocalStorage utility functions for data persistence

const STORAGE_KEYS = {
    USERS: 'expense_tracker_users',
    CURRENT_USER: 'expense_tracker_current_user',
    TRANSACTIONS: 'expense_tracker_transactions',
    CATEGORIES: 'expense_tracker_categories',
    SETTINGS: 'expense_tracker_settings'
};

// User Management
export const getUsers = () => {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
};

export const saveUsers = (users) => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
};

export const registerUser = (userData) => {
    const users = getUsers();
    const existingUser = users.find(u => u.email === userData.email);

    if (existingUser) {
        throw new Error('User already exists with this email');
    }

    const newUser = {
        id: Date.now().toString(),
        ...userData,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    // Initialize empty transactions and settings for new user
    saveTransactions(newUser.id, []);
    saveSettings(newUser.id, getDefaultSettings());

    return newUser;
};

export const loginUser = (email, password) => {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        throw new Error('Invalid email or password');
    }

    setCurrentUser(user);
    return user;
};

export const getCurrentUser = () => {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user) => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
};

export const logoutUser = () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
};

// Transaction Management
export const getTransactions = (userId) => {
    const key = `${STORAGE_KEYS.TRANSACTIONS}_${userId}`;
    const transactions = localStorage.getItem(key);
    return transactions ? JSON.parse(transactions) : [];
};

export const saveTransactions = (userId, transactions) => {
    const key = `${STORAGE_KEYS.TRANSACTIONS}_${userId}`;
    localStorage.setItem(key, JSON.stringify(transactions));
};

export const addTransaction = (userId, transaction) => {
    const transactions = getTransactions(userId);
    const newTransaction = {
        id: Date.now().toString(),
        ...transaction,
        createdAt: new Date().toISOString()
    };

    transactions.unshift(newTransaction);
    saveTransactions(userId, transactions);
    return newTransaction;
};

export const updateTransaction = (userId, transactionId, updates) => {
    const transactions = getTransactions(userId);
    const index = transactions.findIndex(t => t.id === transactionId);

    if (index !== -1) {
        transactions[index] = { ...transactions[index], ...updates, updatedAt: new Date().toISOString() };
        saveTransactions(userId, transactions);
        return transactions[index];
    }

    throw new Error('Transaction not found');
};

export const deleteTransaction = (userId, transactionId) => {
    const transactions = getTransactions(userId);
    const filtered = transactions.filter(t => t.id !== transactionId);
    saveTransactions(userId, filtered);
};

// Settings Management
export const getDefaultSettings = () => ({
    currency: 'INR',
    currencySymbol: '₹',
    lowBalanceThreshold: 1000,
    alertsEnabled: true,
    theme: 'dark'
});

export const getSettings = (userId) => {
    const key = `${STORAGE_KEYS.SETTINGS}_${userId}`;
    const settings = localStorage.getItem(key);
    return settings ? JSON.parse(settings) : getDefaultSettings();
};

export const saveSettings = (userId, settings) => {
    const key = `${STORAGE_KEYS.SETTINGS}_${userId}`;
    localStorage.setItem(key, JSON.stringify(settings));
};

// Categories
export const getDefaultCategories = () => ({
    income: [
        { id: 'salary', name: 'Salary', icon: '💰', color: '#38ef7d' },
        { id: 'freelance', name: 'Freelance', icon: '💻', color: '#667eea' },
        { id: 'investments', name: 'Investments', icon: '📈', color: '#f093fb' },
        { id: 'business', name: 'Business', icon: '🏢', color: '#ffd200' },
        { id: 'rental', name: 'Rental', icon: '🏠', color: '#11998e' },
        { id: 'other_income', name: 'Other', icon: '💵', color: '#a0aec0' }
    ],
    expense: [
        { id: 'food', name: 'Food & Dining', icon: '🍔', color: '#f45c43' },
        { id: 'transport', name: 'Transport', icon: '🚗', color: '#667eea' },
        { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#f093fb' },
        { id: 'bills', name: 'Bills & Utilities', icon: '📱', color: '#ffd200' },
        { id: 'entertainment', name: 'Entertainment', icon: '🎬', color: '#764ba2' },
        { id: 'health', name: 'Healthcare', icon: '🏥', color: '#eb3349' },
        { id: 'education', name: 'Education', icon: '📚', color: '#11998e' },
        { id: 'travel', name: 'Travel', icon: '✈️', color: '#38ef7d' },
        { id: 'groceries', name: 'Groceries', icon: '🛒', color: '#f7971e' },
        { id: 'rent', name: 'Rent', icon: '🏠', color: '#5a67d8' },
        { id: 'insurance', name: 'Insurance', icon: '🛡️', color: '#718096' },
        { id: 'other_expense', name: 'Other', icon: '📦', color: '#a0aec0' }
    ]
});

export const getCategories = (userId) => {
    const key = `${STORAGE_KEYS.CATEGORIES}_${userId}`;
    const categories = localStorage.getItem(key);
    return categories ? JSON.parse(categories) : getDefaultCategories();
};

export const saveCategories = (userId, categories) => {
    const key = `${STORAGE_KEYS.CATEGORIES}_${userId}`;
    localStorage.setItem(key, JSON.stringify(categories));
};

// Statistics Helpers
export const calculateBalance = (transactions) => {
    return transactions.reduce((acc, t) => {
        return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
};

export const calculateTotalIncome = (transactions) => {
    return transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);
};

export const calculateTotalExpense = (transactions) => {
    return transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);
};

export const getTransactionsByMonth = (transactions, year, month) => {
    return transactions.filter(t => {
        const date = new Date(t.date);
        return date.getFullYear() === year && date.getMonth() === month;
    });
};

export const getTransactionsByCategory = (transactions, type) => {
    const filtered = transactions.filter(t => t.type === type);
    const grouped = {};

    filtered.forEach(t => {
        if (!grouped[t.category]) {
            grouped[t.category] = 0;
        }
        grouped[t.category] += t.amount;
    });

    return grouped;
};

export const getMonthlyData = (transactions, months = 6) => {
    const data = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthTransactions = getTransactionsByMonth(
            transactions,
            date.getFullYear(),
            date.getMonth()
        );

        data.push({
            month: date.toLocaleString('default', { month: 'short' }),
            year: date.getFullYear(),
            income: calculateTotalIncome(monthTransactions),
            expense: calculateTotalExpense(monthTransactions)
        });
    }

    return data;
};
