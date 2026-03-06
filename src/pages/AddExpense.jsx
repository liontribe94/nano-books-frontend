import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useToast } from '../components/ui/Toast';
import {
    ArrowLeft,
    Upload,
    Calendar,
    DollarSign,
    Tag,
    FileText,
    Save,
    Send,
    Receipt
} from 'lucide-react';

const categories = [
    'Office Supplies', 'Travel', 'Software & Tools', 'Marketing',
    'Utilities', 'Professional Services', 'Meals & Entertainment', 'Other'
];

const paymentMethods = ['Credit Card', 'Bank Transfer', 'Cash', 'Check', 'PayPal'];

export default function AddExpense() {
    const navigate = useNavigate();
    const toast = useToast();
    const [form, setForm] = useState({
        vendor: '',
        category: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        payment: '',
        description: '',
        recurring: false,
        receipt: null,
    });

    const [submitting, setSubmitting] = useState(false);

    const update = (field, value) => setForm((p) => ({ ...p, [field]: value }));

    const handleSaveDraft = () => {
        toast('Expense saved as draft', 'info');
        setTimeout(() => navigate('/expenses'), 800);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.vendor || !form.amount || !form.category) {
            toast('Please fill in all required fields', 'warning');
            return;
        }

        setSubmitting(true);
        try {
            // Prepare data for backend
            const expenseData = {
                merchant: form.vendor,
                category: form.category,
                amount: parseFloat(form.amount),
                date: form.date,
                paymentMethod: form.payment,
                description: form.description,
                status: 'Pending'
            };

            await api.expenses.create(expenseData);
            toast('Expense submitted successfully!', 'success');
            setTimeout(() => navigate('/expenses'), 800);
        } catch (error) {
            console.error('Failed to submit expense:', error);
            toast(error.message || 'Failed to submit expense', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/expenses')} className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Add New Expense</h1>
                        <p className="text-sm text-slate-500">Record a new business expense</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={handleSaveDraft} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                        <Save className="w-4 h-4" /> Save Draft
                    </button>
                    <button onClick={handleSubmit} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm shadow-primary/20 transition-all">
                        <Send className="w-4 h-4" /> Submit Expense
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Form */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        {/* Vendor & Category */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-5">
                                <span className="text-primary">🏢</span> Vendor Details
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Vendor / Merchant *</label>
                                    <input
                                        type="text"
                                        value={form.vendor}
                                        onChange={(e) => update('vendor', e.target.value)}
                                        placeholder="e.g. Amazon, Starbucks..."
                                        className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Category *</label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => update('category', e.target.value)}
                                        className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary"
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Amount & Date */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-5">
                                <span className="text-primary">💰</span> Payment Details
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Amount (USD) *</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={form.amount}
                                            onChange={(e) => update('amount', e.target.value)}
                                            placeholder="0.00"
                                            className="w-full py-2.5 pl-9 pr-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                        <input
                                            type="date"
                                            value={form.date}
                                            onChange={(e) => update('date', e.target.value)}
                                            className="w-full py-2.5 pl-9 pr-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Payment Method</label>
                                    <select
                                        value={form.payment}
                                        onChange={(e) => update('payment', e.target.value)}
                                        className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary"
                                    >
                                        <option value="">Select method</option>
                                        {paymentMethods.map((m) => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-4 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="recurring"
                                    checked={form.recurring}
                                    onChange={(e) => update('recurring', e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="recurring" className="text-sm text-slate-600 dark:text-slate-400">This is a recurring expense</label>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-5">
                                <span className="text-primary">📝</span> Additional Details
                            </h3>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Description / Notes</label>
                            <textarea
                                value={form.description}
                                onChange={(e) => update('description', e.target.value)}
                                rows={4}
                                placeholder="Add details about this expense..."
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                            />
                        </div>
                    </div>

                    {/* Right: Receipt Upload + Summary */}
                    <div className="flex flex-col gap-6">
                        {/* Receipt Upload */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                            <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Attach Receipt</h4>
                            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                                <Upload className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                                <p className="text-sm text-slate-500">Drag & drop or <span className="text-primary font-medium">browse</span></p>
                                <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sticky top-4">
                            <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Expense Summary</h4>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Vendor</span>
                                    <span className="font-medium text-slate-800 dark:text-slate-200">{form.vendor || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Category</span>
                                    <span className="font-medium text-slate-800 dark:text-slate-200">{form.category || '—'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Date</span>
                                    <span className="font-medium text-slate-800 dark:text-slate-200">{form.date}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">Payment</span>
                                    <span className="font-medium text-slate-800 dark:text-slate-200">{form.payment || '—'}</span>
                                </div>
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3 flex justify-between">
                                    <span className="font-bold text-slate-800 dark:text-white">Total</span>
                                    <span className="text-xl font-bold text-primary">${form.amount ? parseFloat(form.amount).toFixed(2) : '0.00'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                            <h4 className="font-bold text-sm text-slate-800 dark:text-white mb-4">Tags</h4>
                            <div className="flex flex-wrap gap-2">
                                {['Tax Deductible', 'Client Billable', 'Reimbursable'].map((tag) => (
                                    <button key={tag} type="button" className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary transition-colors border border-transparent hover:border-primary/20">
                                        <Tag className="w-3 h-3 inline mr-1" />{tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
