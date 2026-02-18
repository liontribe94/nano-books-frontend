import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api';
import {
    Search,
    Pencil,
    Plus,
    Package,
    TrendingUp,
    Clock,
    CalendarCheck,
    DollarSign,
    AlertTriangle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    RotateCcw,
    ShoppingCart,
    Loader2
} from 'lucide-react';

/* ─── Stat Card ─── */
const StatCard = ({ label, value, badge, icon: Icon, iconColor = 'text-primary', badgeColor }) => (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{label}</span>
            {Icon && <Icon className={`w-4 h-4 ${iconColor}`} />}
        </div>
        <div className="flex items-center gap-2 mt-2">
            <span className="text-3xl font-bold text-slate-800 dark:text-white">{value}</span>
            {badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor || 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600'}`}>
                    {badge}
                </span>
            )}
        </div>
    </div>
);

/* ─── Type Badge ─── */
const TypeBadge = ({ type }) => {
    const cfg = {
        Sale: { bg: 'bg-red-50 dark:bg-red-500/10 text-red-600', icon: ShoppingCart },
        Return: { bg: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600', icon: RotateCcw },
        'Manual Adj': { bg: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600', icon: Pencil },
        Purchase: { bg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600', icon: Package },
    }[type] || { bg: 'bg-slate-100 text-slate-500', icon: Package };

    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${cfg.bg}`}>
            <Icon className="w-3 h-3" /> {type}
        </span>
    );
};

/* ─── Movement Row ─── */
const MovementRow = ({ date, reference, type, adjustment, balance }) => {
    const isPositive = adjustment > 0;
    return (
        <tr className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
            <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">{date}</td>
            <td className="px-5 py-4">
                <span className="text-sm font-medium text-primary">{reference}</span>
            </td>
            <td className="px-5 py-4"><TypeBadge type={type} /></td>
            <td className="px-5 py-4 text-right">
                <span className={`text-sm font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {isPositive ? '+' : ''}{adjustment}
                </span>
            </td>
            <td className="px-5 py-4 text-right text-sm font-bold text-slate-800 dark:text-slate-200">
                {balance.toLocaleString()}
            </td>
        </tr>
    );
};


export default function Inventory() {
    const navigate = useNavigate();
    const toast = useToast();
    const [activeTab, setActiveTab] = useState(1); // Inventory History active
    const tabs = ['General Info', 'Inventory History', 'Supplier Details'];
    const [loading, setLoading] = useState(true);
    const [movements, setMovements] = useState([]);
    const [stats, setStats] = useState({
        onHand: 0,
        allocated: 0,
        available: 0,
        lowStockThreshold: 50,
        value: 0
    });

    useEffect(() => {
        const fetchInventoryData = async () => {
            setLoading(true);
            try {
                // In a real app, we might get this ID from URL params, defaulting to a specific product for this demo page
                const productId = 'prod_123';

                const [productStats, productMovements] = await Promise.all([
                    api.inventory.getStats().catch(() => ({
                        onHand: 1248, allocated: 82, available: 1166, lowStockThreshold: 50, value: 43555.50
                    })),
                    api.inventory.getMovements(productId).catch(() => [])
                ]);

                // Update stats if endpoint returns aggregate or specific product stats
                // For this demo, we'll assume stats returns the values we need directly or fallback
                setStats({
                    onHand: productStats.onHand || 1248,
                    allocated: productStats.allocated || 82,
                    available: productStats.available || 1166,
                    lowStockThreshold: productStats.lowStockThreshold || 50,
                    value: productStats.value || 43555.50
                });

                // Map movements
                const mappedMovements = Array.isArray(productMovements) && productMovements.length > 0 ? productMovements.map(m => ({
                    date: new Date(m.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                    reference: m.reference,
                    type: m.type,
                    adjustment: m.quantity,
                    balance: m.balanceAfter
                })) : [
                    { date: 'Oct 24, 14:30', reference: '#SO-92102', type: 'Sale', adjustment: -12, balance: 1248 },
                    { date: 'Oct 23, 09:15', reference: '#RT-112', type: 'Return', adjustment: +2, balance: 1260 },
                    { date: 'Oct 21, 16:45', reference: '#MANUAL-04', type: 'Manual Adj', adjustment: -5, balance: 1258 },
                    { date: 'Oct 18, 11:30', reference: '#PO-8821', type: 'Purchase', adjustment: +100, balance: 1263 },
                    { date: 'Oct 15, 10:05', reference: '#SO-91903', type: 'Sale', adjustment: -60, balance: 793 },
                ];
                setMovements(mappedMovements);

            } catch (error) {
                console.error("Inventory fetch error", error);
                toast('Failed to load inventory data', 'error');
                // Fallback handled in catch blocks above or defaults
            } finally {
                setLoading(false);
            }
        };

        fetchInventoryData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    /* Simple bar chart data for 30-day trend */
    const barData = [40, 55, 50, 65, 60, 75, 70, 85, 90, 80, 95, 100];

    return (
        <div className="flex flex-col gap-6 pb-12">
            {/* ── Breadcrumb + Header ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">
                        <span>Inventory</span>
                        <span>›</span>
                        <span>Products</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Professional Ergo Chair</h1>
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500">SKU-2064-1-8</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => toast('Edit product form coming soon', 'info')} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                        <Pencil className="w-4 h-4" />
                        Edit Product
                    </button>
                    <button onClick={() => navigate('/inventory/new')} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm shadow-primary/20 transition-all">
                        <Plus className="w-4 h-4" />
                        Add Stock
                    </button>
                </div>
            </div>

            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard label="On Hand" value={stats.onHand.toLocaleString()} badge="+10%" icon={Package} />
                <StatCard label="Allocated" value={stats.allocated} icon={ShoppingCart} iconColor="text-slate-400" />
                <StatCard label="Available" value={stats.available.toLocaleString()} icon={CheckCircle2} iconColor="text-emerald-500" />
                <StatCard
                    label="Low Stock Threshold"
                    value={stats.lowStockThreshold}
                    icon={AlertTriangle}
                    iconColor="text-amber-500"
                />
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
                {tabs.map((tab, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveTab(i)}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === i
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* ── Main Content ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Movement Log (2 cols) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 justify-between items-center">
                        <h3 className="font-bold text-slate-800 dark:text-white">Movement Log</h3>
                        <div className="flex items-center gap-2">
                            <div className="relative w-44">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Filter history..."
                                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                <tr>
                                    <th className="px-5 py-3">Date</th>
                                    <th className="px-5 py-3">Reference</th>
                                    <th className="px-5 py-3">Type</th>
                                    <th className="px-5 py-3 text-right">Adjustment</th>
                                    <th className="px-5 py-3 text-right">Balance</th>
                                </tr>
                            </thead>
                            <tbody>
                                {movements.map((m, i) => (
                                    <MovementRow key={i} {...m} />
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
                        <span>Showing 5 of 147 movements</span>
                        <div className="flex items-center gap-1">
                            <button className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-xs disabled:opacity-50" disabled>Previous</button>
                            <button className="px-2.5 py-1 bg-primary text-white rounded text-xs font-bold">1</button>
                            <button onClick={() => toast('Loading page 2...', 'info')} className="px-2.5 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-xs">2</button>
                            <button onClick={() => toast('Loading next page...', 'info')} className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-xs">Next</button>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-6">
                    {/* 30-Day Trend */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="font-bold text-sm text-slate-800 dark:text-white">30-Day Trend</h4>
                            <span className="text-xs font-bold text-emerald-600 flex items-center gap-0.5">
                                <TrendingUp className="w-3.5 h-3.5" /> +4.2% Growth
                            </span>
                        </div>

                        {/* Simple SVG bar chart */}
                        <div className="h-32">
                            <svg viewBox="0 0 240 100" className="w-full h-full" preserveAspectRatio="none">
                                {barData.map((val, i) => (
                                    <rect
                                        key={i}
                                        x={i * 20 + 2}
                                        y={100 - val}
                                        width="14"
                                        height={val}
                                        rx="2"
                                        className="fill-primary/70 hover:fill-primary transition-colors"
                                    />
                                ))}
                            </svg>
                        </div>
                        <div className="flex justify-between mt-2 text-[9px] text-slate-400 font-medium">
                            <span>Sep 20</span>
                            <span>Sep 10</span>
                            <span>Today</span>
                        </div>
                    </div>

                    {/* Stock Insights */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Stock Insights</h4>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <Clock className="w-4 h-4 text-slate-400" />
                                    Avg. Turnaround
                                </span>
                                <span className="text-sm font-bold text-slate-800 dark:text-white">14.3 Days</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <CalendarCheck className="w-4 h-4 text-slate-400" />
                                    Last Restock
                                </span>
                                <span className="text-sm font-bold text-slate-800 dark:text-white">6 Days Ago</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                                    <DollarSign className="w-4 h-4 text-slate-400" />
                                    Inventory Value
                                </span>
                                <span className="text-sm font-bold text-slate-800 dark:text-white">${stats.value.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Product Visualization */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 shadow-sm p-5 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-full h-36 bg-slate-700/50 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                                <div className="w-24 h-24 bg-gradient-to-br from-amber-700 to-amber-900 rounded-xl rotate-12 opacity-80"></div>
                            </div>
                            <button onClick={() => toast('3D product visualization coming soon!', 'info')} className="flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg text-xs font-bold transition-colors backdrop-blur-sm border border-primary/20">
                                <Package className="w-3.5 h-3.5" />
                                Product Visualization
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Footer ── */}
            <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800">
                © 2024 Nano Books Accounting System. All rights reserved. · <a href="#" className="text-primary hover:underline">Privacy Policy</a> · <a href="#" className="text-primary hover:underline">Terms of Service</a>
            </div>
        </div>
    );
}
