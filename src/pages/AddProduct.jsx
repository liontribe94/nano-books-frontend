import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api';
import {
    ArrowLeft,
    Package,
    Tag,
    DollarSign,
    Layers,
    Save,
    Archive,
    BarChart,
    Truck
} from 'lucide-react';

const categories = [
    'Electronics', 'Furniture', 'Office Supplies', 'Books',
    'Clothing', 'Food & Beverage', 'Health & Beauty', 'Other'
];

export default function AddProduct() {
    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        sku: '',
        category: '',
        description: '',
        costPrice: '',
        sellingPrice: '',
        initialStock: '',
        minStockLevel: '10',
        supplier: '',
        location: ''
    });

    const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name || !form.sku || !form.sellingPrice) {
            toast('Please fill in Name, SKU and Selling Price', 'warning');
            return;
        }

        setLoading(true);
        try {
            await api.inventory.create({
                ...form,
                costPrice: parseFloat(form.costPrice) || 0,
                sellingPrice: parseFloat(form.sellingPrice) || 0,
                initialStock: parseInt(form.initialStock) || 0,
                minStockLevel: parseInt(form.minStockLevel) || 0,
                createdAt: new Date().toISOString()
            });

            toast('Product added to inventory successfully!', 'success');
            setTimeout(() => navigate('/inventory'), 800);
        } catch (error) {
            console.error('Failed to create product:', error);
            toast(error.message || 'Failed to create product', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/inventory')} className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Add New Product</h1>
                        <p className="text-sm text-slate-500">Create a new inventory item</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => navigate('/inventory')} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm shadow-primary/20 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                        <Save className="w-4 h-4" />
                        {loading ? 'Saving...' : 'Save Product'}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Basic Info */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* General Information */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-5">
                                <span className="text-primary"><Package className="w-4 h-4" /></span> General Information
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Product Name *</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => update('name', e.target.value)}
                                        placeholder="e.g. Ergonomic Office Chair"
                                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">SKU *</label>
                                        <div className="relative">
                                            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                            <input
                                                type="text"
                                                value={form.sku}
                                                onChange={(e) => update('sku', e.target.value)}
                                                placeholder="e.g. FURN-001"
                                                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                                        <select
                                            value={form.category}
                                            onChange={(e) => update('category', e.target.value)}
                                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        >
                                            <option value="">Select Category</option>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => update('description', e.target.value)}
                                        rows="3"
                                        placeholder="Product description and details..."
                                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        {/* Pricing & Inventory */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-5">
                                <span className="text-emerald-500"><DollarSign className="w-4 h-4" /></span> Pricing & Inventory
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Cost Price</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                        <input
                                            type="number"
                                            value={form.costPrice}
                                            onChange={(e) => update('costPrice', e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-7 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Selling Price *</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                                        <input
                                            type="number"
                                            value={form.sellingPrice}
                                            onChange={(e) => update('sellingPrice', e.target.value)}
                                            placeholder="0.00"
                                            className="w-full pl-7 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Initial Stock</label>
                                    <div className="relative">
                                        <Layers className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input
                                            type="number"
                                            value={form.initialStock}
                                            onChange={(e) => update('initialStock', e.target.value)}
                                            placeholder="0"
                                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Min Stock Level</label>
                                    <div className="relative">
                                        <Archive className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input
                                            type="number"
                                            value={form.minStockLevel}
                                            onChange={(e) => update('minStockLevel', e.target.value)}
                                            placeholder="10"
                                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Supplier & Extra */}
                    <div className="flex flex-col gap-6">
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-5">
                                <span className="text-orange-500"><Truck className="w-4 h-4" /></span> Supplier Details
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Supplier Name</label>
                                    <input
                                        type="text"
                                        value={form.supplier}
                                        onChange={(e) => update('supplier', e.target.value)}
                                        placeholder="e.g. Global Imports Ltd."
                                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Location / Warehouse</label>
                                    <input
                                        type="text"
                                        value={form.location}
                                        onChange={(e) => update('location', e.target.value)}
                                        placeholder="e.g. Warehouse A, Shelf 3"
                                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary/5 rounded-xl border border-primary/10 p-5">
                            <h4 className="font-bold text-primary flex items-center gap-2 mb-2">
                                <BarChart className="w-4 h-4" /> Stock Value Estimate
                            </h4>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                                Based on current input:
                            </p>
                            <div className="flex justify-between items-end border-t border-primary/10 pt-3">
                                <span className="text-xs uppercase font-bold text-slate-500">Total Value</span>
                                <span className="text-xl font-bold text-primary">
                                    ${((parseFloat(form.costPrice) || 0) * (parseInt(form.initialStock) || 0)).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
