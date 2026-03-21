import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api';
import {
    Search,
    Plus,
    Package,
    TrendingUp,
    DollarSign,
    AlertTriangle,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    ArrowUpDown,
    Eye,
    Pencil,
    Trash2,
    Loader2,
    BoxSelect
} from 'lucide-react';

/* ─── Stat Card ─── */
const StatCard = ({ label, value, icon: Icon, iconColor = 'text-primary', badgeColor }) => (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{label}</span>
            {Icon && <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor} bg-opacity-10`}>
                <Icon className="w-4 h-4" />
            </div>}
        </div>
        <div className="flex items-center gap-2 mt-2">
            <span className="text-3xl font-bold text-slate-800 dark:text-white">{value}</span>
        </div>
    </div>
);

/* ─── Stock Status Badge ─── */
const StockBadge = ({ quantity, reorderPoint }) => {
    if (quantity <= 0) {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-red-50 dark:bg-red-500/10 text-red-600">
                <AlertTriangle className="w-3 h-3" /> Out of Stock
            </span>
        );
    }
    if (quantity <= (reorderPoint || 5)) {
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-50 dark:bg-amber-500/10 text-amber-600">
                <AlertTriangle className="w-3 h-3" /> Low Stock
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="w-3 h-3" /> In Stock
        </span>
    );
};

export default function Inventory() {
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [stats, setStats] = useState({
        onHand: 0,
        allocated: 0,
        available: 0,
        lowStockThreshold: 50,
        value: 0
    });

    const ITEMS_PER_PAGE = 10;

    const fetchData = async () => {
        setLoading(true);
        try {
            const [productsRes, statsRes] = await Promise.all([
                api.inventory.getAll().catch(() => ({ data: [] })),
                api.inventory.getStats().catch(() => ({
                    data: { onHand: 0, allocated: 0, available: 0, lowStockThreshold: 10, value: 0 }
                }))
            ]);

            const productsData = productsRes?.data || productsRes || [];
            setProducts(Array.isArray(productsData) ? productsData : []);

            const statsData = statsRes?.data || statsRes;
            setStats({
                onHand: statsData?.onHand || 0,
                allocated: statsData?.allocated || 0,
                available: statsData?.available || 0,
                lowStockThreshold: statsData?.lowStockThreshold || 10,
                value: statsData?.value || 0
            });
        } catch (error) {
            console.error('Inventory fetch error:', error);
            toast('Failed to load inventory data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
        try {
            await api.inventory.delete(id);
            toast('Product deleted successfully', 'success');
            fetchData();
        } catch (error) {
            console.error('Delete error:', error);
            toast('Failed to delete product', 'error');
        }
    };

    /* ─── Filtering & Pagination ─── */
    const filteredProducts = products.filter(p =>
        (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 pb-12">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">
                        <span>Inventory</span>
                        <span>›</span>
                        <span>Products</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Inventory Management</h1>
                    <p className="text-sm text-slate-500 mt-1">Track and manage your product inventory</p>
                </div>
                <button
                    onClick={() => navigate('/inventory/new')}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm shadow-primary/20 transition-all"
                >
                    <Plus className="w-4 h-4" />
                    Add Product
                </button>
            </div>

            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard label="Total Products" value={products.length} icon={Package} iconColor="text-primary" />
                <StatCard label="On Hand" value={stats.onHand.toLocaleString()} icon={BoxSelect} iconColor="text-blue-500" />
                <StatCard label="Low Stock Items" value={products.filter(p => (p.stockQuantity || 0) <= (p.reorderPoint || 5) && (p.stockQuantity || 0) > 0).length} icon={AlertTriangle} iconColor="text-amber-500" />
                <StatCard
                    label="Inventory Value"
                    value={`$${stats.value.toLocaleString()}`}
                    icon={DollarSign}
                    iconColor="text-emerald-500"
                />
            </div>

            {/* ── Search & Filter Bar ── */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 justify-between items-center">
                    <h3 className="font-bold text-slate-800 dark:text-white">All Products</h3>
                    <div className="flex items-center gap-2">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>
                </div>

                {/* ── Products Table ── */}
                {filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <Package className="w-12 h-12 mb-3 opacity-50" />
                        <p className="font-medium">{searchQuery ? 'No products match your search' : 'No products yet'}</p>
                        <p className="text-sm mt-1">
                            {searchQuery ? 'Try a different search term' : 'Click "Add Product" to get started'}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                    <tr>
                                        <th className="px-5 py-3">Product</th>
                                        <th className="px-5 py-3">SKU</th>
                                        <th className="px-5 py-3 text-right">Cost</th>
                                        <th className="px-5 py-3 text-right">Price</th>
                                        <th className="px-5 py-3 text-center">Stock</th>
                                        <th className="px-5 py-3">Status</th>
                                        <th className="px-5 py-3 text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedProducts.map((product) => {
                                        const stockQty = product.stockQuantity || product.stock_quantity || 0;
                                        const reorderPt = product.reorderPoint || product.reorder_point || 5;
                                        const cost = product.cost || 0;
                                        const price = product.price || 0;
                                        const description = product.description || '';

                                        return (
                                            <tr
                                                key={product.id}
                                                className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors cursor-pointer"
                                                onClick={() => navigate(`/inventory/${product.id}`)}
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                            <Package className="w-4 h-4 text-primary" />
                                                        </div>
                                                        <div>
                                                            <span className="text-sm font-semibold text-slate-800 dark:text-white block">{product.name}</span>
                                                            {description && (
                                                                <span className="text-xs text-slate-400 line-clamp-1">{description}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-500">{product.sku}</span>
                                                </td>
                                                <td className="px-5 py-4 text-right text-sm text-slate-600 dark:text-slate-400">
                                                    ${Number(cost).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-5 py-4 text-right text-sm font-semibold text-slate-800 dark:text-white">
                                                    ${Number(price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="px-5 py-4 text-center">
                                                    <span className="text-sm font-bold text-slate-800 dark:text-white">
                                                        {Number(stockQty).toLocaleString()}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <StockBadge quantity={stockQty} reorderPoint={reorderPt} />
                                                </td>
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                        <button
                                                            onClick={() => navigate(`/inventory/${product.id}`)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-colors"
                                                            title="View Details"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(product.id, product.name)}
                                                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Pagination ── */}
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
                            <span>
                                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} of {filteredProducts.length} products
                            </span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-xs disabled:opacity-50 flex items-center gap-1"
                                >
                                    <ChevronLeft className="w-3 h-3" /> Previous
                                </button>
                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(page => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-2.5 py-1 rounded text-xs font-bold ${currentPage === page
                                            ? 'bg-primary text-white'
                                            : 'border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages || totalPages === 0}
                                    className="px-2 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-xs disabled:opacity-50 flex items-center gap-1"
                                >
                                    Next <ChevronRight className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ── Footer ── */}
            <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800">
                © 2024 Nano Books Accounting System. All rights reserved. · <button onClick={() => navigate('/privacy')} className="text-primary hover:underline">Privacy Policy</button> · <button onClick={() => navigate('/terms')} className="text-primary hover:underline">Terms of Service</button>
            </div>
        </div>
    );
}
