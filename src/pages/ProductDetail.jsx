import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api';
import {
    Search,
    Pencil,
    ArrowLeft,
    Package,
    Clock,
    CalendarCheck,
    DollarSign,
    AlertTriangle,
    RotateCcw,
    ShoppingCart,
    Loader2
} from 'lucide-react';

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

const TypeBadge = ({ type }) => {
    const cfg = {
        Sale: { bg: 'bg-red-50 dark:bg-red-500/10 text-red-600', icon: ShoppingCart },
        Return: { bg: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600', icon: RotateCcw },
        'Manual Adj': { bg: 'bg-purple-50 dark:bg-purple-500/10 text-purple-600', icon: Pencil },
        Purchase: { bg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600', icon: Package },
        'Opening Stock': { bg: 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600', icon: Package }
    }[type] || { bg: 'bg-slate-100 text-slate-500', icon: Package };

    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${cfg.bg}`}>
            <Icon className="w-3 h-3" /> {type}
        </span>
    );
};

const MovementRow = ({ date, reference, type, adjustment }) => {
    const isPositive = adjustment > 0;
    return (
        <tr className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
            <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">{date}</td>
            <td className="px-5 py-4"><span className="text-sm font-medium text-primary">{reference}</span></td>
            <td className="px-5 py-4"><TypeBadge type={type} /></td>
            <td className="px-5 py-4 text-right">
                <span className={`text-sm font-bold ${isPositive ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {isPositive ? '+' : ''}{adjustment}
                </span>
            </td>
        </tr>
    );
};

export default function ProductDetail() {
    const navigate = useNavigate();
    const toast = useToast();
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState(1);
    const tabs = ['General Info', 'Inventory History', 'Supplier Details'];
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [product, setProduct] = useState(null);
    const [movements, setMovements] = useState([]);

    const fetchProductData = async () => {
        setLoading(true);
        try {
            const [productRes, movementsRes] = await Promise.all([
                api.inventory.getOne(id).catch(() => null),
                api.inventory.getMovements(id).catch(() => ({ data: [] }))
            ]);

            const productData = productRes?.data || productRes;
            setProduct(productData);

            const movementsData = movementsRes?.data || movementsRes;
            const mapped = Array.isArray(movementsData) ? movementsData.map((m) => ({
                date: new Date(m.createdAt || m.date || Date.now()).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                reference: m.referenceId || m.reference || (m.id ? String(m.id).slice(0, 8) : 'N/A'),
                type: m.reason || (m.type === 'IN' ? 'Purchase' : 'Sale'),
                adjustment: m.type === 'OUT' ? -Math.abs(Number(m.quantity || 0)) : Math.abs(Number(m.quantity || 0))
            })) : [];
            setMovements(mapped);
        } catch (error) {
            toast(error.message || 'Failed to load product data', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchProductData();
    }, [id]);

    const filteredMovements = useMemo(() => {
        return movements.filter((m) => {
            if (!searchTerm) return true;
            const q = searchTerm.toLowerCase();
            return String(m.reference).toLowerCase().includes(q) || String(m.type).toLowerCase().includes(q);
        });
    }, [movements, searchTerm]);

    const handleEditProduct = async () => {
        if (!product?.id) return;

        const name = window.prompt('Product name', product.name || '');
        if (!name) return;
        const price = window.prompt('Selling price', String(product.price || 0));
        const stock = window.prompt('Stock quantity', String(product.stockQuantity || product.stock_quantity || 0));

        try {
            await api.inventory.update(product.id, {
                name,
                price: Number(price || 0),
                stockQuantity: Number(stock || 0)
            });
            toast('Product updated successfully', 'success');
            fetchProductData();
        } catch (error) {
            toast(error.message || 'Failed to update product', 'error');
        }
    };

    if (loading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    if (!product) {
        return (
            <div className="flex flex-col h-96 items-center justify-center text-slate-400">
                <Package className="w-12 h-12 mb-3 opacity-50" />
                <p className="font-medium">Product not found</p>
                <button onClick={() => navigate('/inventory')} className="mt-4 text-primary hover:underline text-sm">Back to Inventory</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 uppercase font-bold tracking-wider mb-2">
                        <button onClick={() => navigate('/inventory')} className="hover:text-primary transition-colors">Inventory</button>
                        <span>›</span>
                        <span>Product Detail</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/inventory')} className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <ArrowLeft className="w-4 h-4" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{product.name}</h1>
                            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500">{product.sku}</span>
                        </div>
                    </div>
                </div>
                <button onClick={handleEditProduct} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                    <Pencil className="w-4 h-4" />
                    Edit Product
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard label="In Stock" value={(product.stockQuantity || 0).toLocaleString()} icon={Package} />
                <StatCard label="Cost Price" value={`$${(product.cost || 0).toFixed(2)}`} icon={DollarSign} iconColor="text-slate-400" />
                <StatCard label="Selling Price" value={`$${(product.price || 0).toFixed(2)}`} icon={DollarSign} iconColor="text-emerald-500" />
                <StatCard label="Reorder Point" value={product.reorderPoint || 5} icon={AlertTriangle} iconColor="text-amber-500" />
            </div>

            <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
                {tabs.map((tab, i) => (
                    <button key={i} onClick={() => setActiveTab(i)} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === i ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 justify-between items-center">
                        <h3 className="font-bold text-slate-800 dark:text-white">Movement Log</h3>
                        <div className="relative w-full sm:w-44">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Filter history..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>

                    <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredMovements.length > 0 ? filteredMovements.map((m, i) => (
                            <div key={i} className="p-4 space-y-2">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-xs text-slate-500">{m.date}</p>
                                    <TypeBadge type={m.type} />
                                </div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{m.reference}</p>
                                <p className={`text-sm font-bold ${m.adjustment > 0 ? 'text-emerald-600' : 'text-rose-500'}`}>{m.adjustment > 0 ? '+' : ''}{m.adjustment}</p>
                            </div>
                        )) : (
                            <div className="px-5 py-12 text-center text-sm text-slate-400">No stock movements yet</div>
                        )}
                    </div>

                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left min-w-[680px]">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                <tr>
                                    <th className="px-5 py-3">Date</th>
                                    <th className="px-5 py-3">Reference</th>
                                    <th className="px-5 py-3">Type</th>
                                    <th className="px-5 py-3 text-right">Adjustment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMovements.length > 0 ? filteredMovements.map((m, i) => <MovementRow key={i} {...m} />) : (
                                    <tr><td colSpan="4" className="px-5 py-12 text-center text-sm text-slate-400">No stock movements yet</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
                        <span>Showing {filteredMovements.length} movement{filteredMovements.length !== 1 ? 's' : ''}</span>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                        <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Stock Insights</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"><Clock className="w-4 h-4 text-slate-400" />Stock Quantity</span><span className="text-sm font-bold text-slate-800 dark:text-white">{(product.stockQuantity || 0).toLocaleString()}</span></div>
                            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"><CalendarCheck className="w-4 h-4 text-slate-400" />Created</span><span className="text-sm font-bold text-slate-800 dark:text-white">{product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}</span></div>
                            <div className="flex items-center justify-between"><span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400"><DollarSign className="w-4 h-4 text-slate-400" />Inventory Value</span><span className="text-sm font-bold text-slate-800 dark:text-white">${((product.price || 0) * (product.stockQuantity || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 shadow-sm p-5 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-full h-36 bg-slate-700/50 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                                <Package className="w-16 h-16 text-slate-500 opacity-50" />
                            </div>
                            <span className="text-sm font-bold text-white mb-1">{product.name}</span>
                            <span className="text-xs text-slate-400">{product.description || 'No description'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

