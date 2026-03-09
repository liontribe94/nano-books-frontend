import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api';
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Download,
    Receipt,
    Coffee,
    Server,
    Zap,
    Briefcase,
    Loader2,
    Trash2,
    RefreshCw
} from 'lucide-react';

const ExpenseRow = ({ id, merchant, category, amount, date, status, onAction, onDelete }) => {
    const categoryStyles = {
        Software: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600',
        Meals: 'bg-orange-50 dark:bg-orange-500/10 text-orange-600',
        Office: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600',
        Travel: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600'
    };

    const CategoryIcon = {
        Software: Server,
        Meals: Coffee,
        Office: Briefcase,
        Travel: Zap
    }[category] || Receipt;

    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
            <td className="px-6 py-4">
                <span className="font-medium text-slate-800 dark:text-slate-200">{merchant}</span>
                <p className="text-xs text-slate-500">#{id}</p>
            </td>
            <td className="px-6 py-4 text-center text-sm text-slate-500">{new Date(date).toLocaleDateString()}</td>
            <td className="px-6 py-4 text-center">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${categoryStyles[category] || 'bg-slate-100 text-slate-600'}`}>
                    <CategoryIcon className="w-3.5 h-3.5" />
                    {category}
                </span>
            </td>
            <td className="px-6 py-4 text-right font-bold text-slate-800 dark:text-slate-200">
                ${parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </td>
            <td className="px-6 py-4 text-center">
                <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${(status || '').toLowerCase() === 'approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {status}
                </span>
            </td>
            <td className="px-6 py-4 text-center">
                <div className="flex items-center justify-center gap-2 text-slate-400">
                    <button onClick={() => onAction(id)} className="hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                    <button onClick={() => onDelete(id)} className="hover:text-rose-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default function Expenses() {
    const navigate = useNavigate();
    const toast = useToast();
    const [expenses, setExpenses] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [statusFilter, setStatusFilter] = React.useState('all');

    const fetchExpenses = async () => {
        setLoading(true);
        try {
            const res = await api.expenses.getAll();
            const data = res?.data || res || [];

            const formatted = data.map((exp) => ({
                id: exp.id,
                merchant: exp.merchant || exp.vendor || 'Unknown',
                category: exp.category || 'Other',
                amount: exp.amount || exp.total_amount || 0,
                date: exp.date || exp.created_at || new Date(),
                status: exp.status || 'Pending'
            }));

            setExpenses(formatted);
        } catch (error) {
            toast(error.message || 'Failed to load expenses', 'error');
            setExpenses([]);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchExpenses();
    }, []);

    const filteredExpenses = useMemo(() => {
        return expenses.filter((exp) => {
            const matchesSearch = !searchTerm
                || (exp.merchant || '').toLowerCase().includes(searchTerm.toLowerCase())
                || (exp.category || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || (exp.status || '').toLowerCase() === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [expenses, searchTerm, statusFilter]);

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) return;
        try {
            await api.expenses.delete(id);
            toast('Expense deleted successfully', 'success');
            fetchExpenses();
        } catch (error) {
            toast(error.message || 'Failed to delete expense', 'error');
        }
    };

    const handleViewExpense = async (id) => {
        try {
            const res = await api.expenses.getOne(id);
            const exp = res?.data || res;
            toast(`Expense: ${exp?.merchant || exp?.vendor || 'Expense'} (${exp?.status || 'Pending'})`, 'info');
        } catch (error) {
            toast(error.message || 'Failed to fetch expense details', 'error');
        }
    };

    const handleExport = () => {
        const header = ['id', 'merchant', 'category', 'amount', 'date', 'status'];
        const rows = filteredExpenses.map((exp) => [exp.id, exp.merchant, exp.category, exp.amount, new Date(exp.date).toISOString(), exp.status]);
        const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'expenses.csv';
        a.click();
        URL.revokeObjectURL(url);
        toast('Expenses exported', 'success');
    };

    const categoryTotals = filteredExpenses.reduce((acc, exp) => {
        const cat = exp.category || 'Other';
        acc[cat] = (acc[cat] || 0) + Number(exp.amount);
        return acc;
    }, {});

    const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const topCategories = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a).slice(0, 3);

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Expenses</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Track and manage company spending.</p>
                </div>
                <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                    <button onClick={handleExport} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                        <Download className="w-4 h-4" />
                        <span className="hidden xs:inline">Export</span>
                    </button>
                    <button onClick={() => navigate('/expenses/new')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm shadow-primary/20 transition-all">
                        <Plus className="w-4 h-4" />
                        Add Expense
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center">
                    <h4 className="w-full font-bold text-slate-800 dark:text-white mb-4 text-left">Category Breakdown</h4>
                    <div className="w-40 h-40 rounded-full border-[16px] border-slate-100 dark:border-slate-800 relative flex items-center justify-center">
                        <div className="absolute inset-0 rounded-full border-[16px] border-primary border-t-transparent border-l-transparent -rotate-45"></div>
                        <div className="text-center">
                            <p className="text-xs text-slate-400 uppercase font-bold">Total</p>
                            <p className="text-xl font-bold">${totalSpent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                    </div>
                    <div className="mt-6 w-full space-y-2">
                        {topCategories.length > 0 ? topCategories.map(([cat, amount], idx) => (
                            <div key={cat} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-primary' : idx === 1 ? 'bg-blue-400' : 'bg-indigo-300'}`}></span>
                                    <span className="text-slate-600 dark:text-slate-400">{cat}</span>
                                </div>
                                <span className="font-semibold">{totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0}%</span>
                            </div>
                        )) : (
                            <p className="text-xs text-slate-400 text-center italic">No data available</p>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[400px]">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search expenses..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setStatusFilter((s) => s === 'all' ? 'pending' : s === 'pending' ? 'approved' : 'all')}
                                className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <Filter className="w-4 h-4" />
                                Filter: {statusFilter}
                            </button>
                            <button onClick={fetchExpenses} className="flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <RefreshCw className="w-4 h-4" />
                                Refresh
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Merchant</th>
                                        <th className="px-6 py-4 text-center">Date</th>
                                        <th className="px-6 py-4 text-center">Category</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                        <th className="px-6 py-4 text-center">Status</th>
                                        <th className="px-6 py-4 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {filteredExpenses.length > 0 ? (
                                        filteredExpenses.map((expense, idx) => (
                                            <ExpenseRow
                                                key={expense.id || idx}
                                                {...expense}
                                                onAction={handleViewExpense}
                                                onDelete={handleDelete}
                                            />
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-10 text-center text-slate-500">No expenses found</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
