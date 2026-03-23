
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import CurrencySelect from '../components/ui/CurrencySelect';
import {
    TrendingUp,
    CreditCard,
    Wallet,
    Banknote,
    MoreHorizontal,
    Cloud,
    Store,
    Megaphone,
    ArrowUp,
    ArrowDown,
    Loader2,
    Plus,
    FileText,
    Package,
    ShoppingCart
} from 'lucide-react';

const KPICard = ({ title, value, change, icon: Icon, trend, colorClass, bgClass }) => (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-2 rounded-lg ${bgClass} ${colorClass}`}>
                <Icon className="w-5 h-5" />
            </div>
            <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${bgClass} ${colorClass}`}>
                {trend === 'up' ? <ArrowUp className="w-3 h-3 mr-1" /> : <ArrowDown className="w-3 h-3 mr-1" />}
                {change}
            </span>
        </div>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{value}</h3>
        <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-wide">Compared to last month</p>
    </div>
);

const TransactionRow = ({ icon: Icon, name, subtext, date, category, amount, status }) => {
    const isPositive = amount.startsWith('+');
    const statusColors = {
        Cleared: 'text-emerald-600',
        Pending: 'text-amber-500',
    };
    const statusDotColors = {
        Cleared: 'bg-emerald-500',
        Pending: 'bg-amber-500',
    };

    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <Icon className="text-slate-400 w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{name}</p>
                        <p className="text-xs text-slate-400">{subtext}</p>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 text-center text-sm text-slate-500">{date}</td>
            <td className="px-6 py-4 text-center">
                <span className={`text-[10px] font-bold py-1 px-2 rounded uppercase ${category.bg} ${category.text}`}>
                    {category.label}
                </span>
            </td>
            <td className={`px-6 py-4 text-right font-bold ${isPositive ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-200'}`}>
                {amount}
            </td>
            <td className="px-6 py-4 text-center">
                <div className={`flex items-center justify-center gap-1.5 font-medium text-xs ${statusColors[status]}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDotColors[status]}`}></span>
                    {status}
                </div>
            </td>
        </tr>
    );
};

export default function Dashboard() {
    const navigate = useNavigate();
    const toast = useToast();
    const { formatCurrency } = useAuth();
    const [timeRange, setTimeRange] = useState('7d');
    const [loading, setLoading] = useState(true);
    const [kpiData, setKpiData] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [cashFlowData, setCashFlowData] = useState([]);
    const [expenseData, setExpenseData] = useState({ total: '$0.00', categories: [] });

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                // Parallel fetching
                const [stats, txs, cashFlow, expenses] = await Promise.all([
                    api.dashboard.getStats(timeRange).catch(err => {
                        console.error('Failed to fetch stats', err);
                        return { revenue: null, expenses: null, profit: null };
                    }),
                    api.dashboard.getTransactions().catch(err => {
                        console.error('Failed to fetch transactions', err);
                        return [];
                    }),
                    api.dashboard.getCashFlow(timeRange).catch(err => {
                        console.error('Failed to fetch cash flow', err);
                        return [];
                    }),
                    api.dashboard.getExpenses(timeRange).catch(err => {
                        console.error('Failed to fetch expenses', err);
                        return { total: 0, categories: [] };
                    })
                ]);

                // Transform API data to UI format
                setKpiData([
                    {
                        title: 'Total Revenue',
                        value: formatCurrency(stats.revenue?.value || 0),
                        change: `${stats.revenue?.change > 0 ? '+' : ''}${stats.revenue?.change || 0}%`,
                        trend: stats.revenue?.change >= 0 ? 'up' : 'down',
                        icon: TrendingUp,
                        colorClass: 'text-emerald-600',
                        bgClass: 'bg-emerald-50 dark:bg-emerald-500/10'
                    },
                    {
                        title: 'Total Expenses',
                        value: formatCurrency(stats.expenses?.value || 0),
                        change: `${stats.expenses?.change > 0 ? '+' : ''}${stats.expenses?.change || 0}%`,
                        trend: stats.expenses?.change <= 0 ? 'up' : 'down', // expenses down is good, but typically red implies "expense" category color
                        icon: Banknote,
                        colorClass: 'text-rose-600',
                        bgClass: 'bg-rose-50 dark:bg-rose-500/10'
                    },
                    {
                        title: 'Net Profit',
                        value: formatCurrency(stats.profit?.value || 0),
                        change: stats.profit?.change ? `${stats.profit.change}%` : 'N/A',
                        trend: 'up',
                        icon: Wallet,
                        colorClass: 'text-primary',
                        bgClass: 'bg-primary/10'
                    }
                ]);

                // Map transactions to UI format if needed, assuming API returns compatible structure or mapping here
                const mappedTxs = Array.isArray(txs) ? txs.map(tx => ({
                    icon: tx.category === 'Software' ? Cloud : tx.category === 'Meals' ? Store : tx.category === 'Marketing' ? Megaphone : CreditCard,
                    name: tx.description || tx.name,
                    subtext: tx.reference || 'REF',
                    date: new Date(tx.date).toLocaleDateString(),
                    category: { label: tx.category || 'General', bg: 'bg-slate-100', text: 'text-slate-600' }, // Simplified mapping
                    amount: `${tx.amount >= 0 ? '+' : '-'}${formatCurrency(Math.abs(tx.amount))}`,
                    status: tx.status || 'Pending'
                })) : [];

                setTransactions(mappedTxs);

                // Prepare Cash Flow Data
                const formattedCashFlow = Array.isArray(cashFlow) ? cashFlow.map(item => ({
                    day: item.day,
                    h: `h-${Math.min(Math.floor((item.income / 100) * 80), 64)}`, // Rough scaling for UI
                    h2: `h-${Math.min(Math.floor((item.outcome / 100) * 80), 40)}`
                })) : [];
                setCashFlowData(formattedCashFlow);

                // Prepare Expense Data
                setExpenseData({
                    total: formatCurrency(expenses?.total || 0),
                    categories: expenses?.categories || []
                });

            } catch (error) {
                console.error("Dashboard load error:", error);
                toast('Failed to load dashboard data.', 'error');
                // Use fallback empty data
                setKpiData([]);
                setTransactions([]);
                setCashFlowData([]);
                setExpenseData({
                    total: formatCurrency(0),
                    categories: []
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [timeRange]);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            {/* Welcome Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Business Overview</h1>
                    <p className="text-slate-500 dark:text-slate-400">Welcome back, Alex. Here's what's happening today.</p>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm self-stretch sm:self-auto overflow-x-auto">
                    <CurrencySelect />
                    {[{ key: '7d', label: '7 Days' }, { key: '30d', label: '30 Days' }, { key: '1y', label: 'Last Year' }].map((t) => (
                        <button key={t.key} onClick={() => { setTimeRange(t.key); toast(`Showing ${t.label} data`, 'info'); }} className={`px-3 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap ${timeRange === t.key ? 'bg-slate-100 dark:bg-slate-700' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>{t.label}</button>
                    ))}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-4 gap-4">
                <button onClick={() => navigate('/expenses/new')} className="flex items-center gap-3 p-4 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all group w-full text-left">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center group-hover:bg-white/30 transition-colors">
                        <Plus className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold">New Transaction</p>
                        <p className="text-[10px] opacity-80">Add expense/income</p>
                    </div>
                </button>

                <Link to="/invoicing" className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">New Invoice</p>
                        <p className="text-[10px] text-slate-500">Create & send</p>
                    </div>
                </Link>

                <Link to="/inventory/new" className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-lg flex items-center justify-center">
                        <Package className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">Add Product</p>
                        <p className="text-[10px] text-slate-500">Stock management</p>
                    </div>
                </Link>

                <Link to="/sales" className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
                    <div className="w-10 h-10 bg-orange-50 dark:bg-orange-500/10 text-orange-600 rounded-lg flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-white">New Sale</p>
                        <p className="text-[10px] text-slate-500">Record order</p>
                    </div>
                </Link>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {kpiData.map((kpi, idx) => (
                    <KPICard key={idx} {...kpi} />
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Cash Flow Line Chart (Visual Placeholder) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-bold text-slate-800 dark:text-white">Cash Flow Trends</h4>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-primary"></span>
                                <span className="text-xs text-slate-500 font-medium">Income</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                                <span className="text-xs text-slate-500 font-medium">Outcome</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-2 relative">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="border-t border-slate-100 dark:border-slate-800 w-full h-px"></div>
                            ))}
                        </div>

                        {/* Bars - Dynamic Data */}
                        {cashFlowData.length > 0 ? cashFlowData.map((bar, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                {/* Visual effect only, using overlay divs roughly matching the HTML provided */}
                                <div className={`w-8 bg-primary/20 rounded-t ${bar.h} group-hover:bg-primary transition-colors relative`}></div>
                                <span className="text-[10px] text-slate-400 mt-2">{bar.day}</span>
                            </div>
                        )) : (
                            // Fallback Visuals if no data
                            [
                                { day: 'Mon', h: 'h-32', h2: 'h-20' },
                                { day: 'Tue', h: 'h-48', h2: 'h-24' },
                                { day: 'Wed', h: 'h-40', h2: 'h-28' },
                                { day: 'Thu', h: 'h-56', h2: 'h-32' },
                                { day: 'Fri', h: 'h-36', h2: 'h-16' },
                                { day: 'Sat', h: 'h-24', h2: 'h-12' },
                                { day: 'Sun', h: 'h-44', h2: 'h-20' },
                            ].map((bar, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                                    <div className={`w-8 bg-primary/20 rounded-t ${bar.h} group-hover:bg-primary transition-colors relative`}></div>
                                    <span className="text-[10px] text-slate-400 mt-2">{bar.day}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Expense Categories Donut */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                    <h4 className="font-bold text-slate-800 dark:text-white mb-6">Expense Categories</h4>
                    <div className="flex-1 flex flex-col items-center justify-center relative">
                        <div className="w-40 h-40 rounded-full border-[16px] border-slate-100 dark:border-slate-800 relative flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-[16px] border-primary border-t-transparent border-l-transparent -rotate-45"></div>
                            <div className="text-center">
                                <p className="text-xs text-slate-400 uppercase font-bold">Total</p>
                                <p className="text-xl font-bold">{expenseData.total}</p>
                            </div>
                        </div>

                        <div className="mt-8 w-full space-y-2">
                            {expenseData.categories.map((cat, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${cat.color || 'bg-slate-400'}`}></span>
                                        <span className="text-slate-600 dark:text-slate-400">{cat.name}</span>
                                    </div>
                                    <span className="font-semibold">{cat.value}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                    <h4 className="font-bold text-slate-800 dark:text-white">Recent Transactions</h4>
                    <button onClick={() => navigate('/expenses')} className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                        View All History
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Transaction Details</th>
                                <th className="px-6 py-4 text-center">Date</th>
                                <th className="px-6 py-4 text-center">Category</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {transactions.map((tx, idx) => (
                                <TransactionRow key={idx} {...tx} />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
