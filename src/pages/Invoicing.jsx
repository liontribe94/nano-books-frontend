import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import {
    Plus,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Save,
    Send,
    Search,
    Eye,
    UserPlus,
    FileText,
    Settings2,
    Printer
} from 'lucide-react';

/* ─── Stepper ─── */
const steps = ['Customer Selection', 'Line Items', 'Review & Settings'];

const Stepper = ({ current }) => (
    <div className="flex items-center gap-0 w-full max-w-md mx-auto">
        {steps.map((s, i) => (
            <React.Fragment key={i}>
                <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${i < current ? 'bg-primary text-white' :
                        i === current ? 'bg-primary text-white' :
                            'bg-slate-200 dark:bg-slate-700 text-slate-500'
                        }`}>
                        {i + 1}
                    </div>
                    <span className={`text-xs font-medium whitespace-nowrap ${i <= current ? 'text-slate-800 dark:text-white' : 'text-slate-400'
                        }`}>
                        {s}
                    </span>
                </div>
                {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-3 ${i < current ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                        }`} />
                )}
            </React.Fragment>
        ))}
    </div>
);

/* ─── Line Item Row ─── */
const LineItemRow = ({ item, onChange, onRemove }) => (
    <tr className="border-b border-slate-100 dark:border-slate-800 last:border-0">
        <td className="py-3 pr-3">
            <div>
                <input
                    type="text"
                    value={item.description}
                    onChange={(e) => onChange({ ...item, description: e.target.value })}
                    placeholder="Select or type an item"
                    className="w-full text-sm font-medium text-slate-800 dark:text-slate-200 bg-transparent border-0 focus:outline-none placeholder:text-slate-400"
                />
                {item.sub && <p className="text-[11px] text-slate-400 mt-0.5">{item.sub}</p>}
            </div>
        </td>
        <td className="py-3 px-3 w-20">
            <input
                type="number"
                value={item.qty}
                onChange={(e) => onChange({ ...item, qty: Number(e.target.value) })}
                className="w-full text-sm text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary"
            />
        </td>
        <td className="py-3 px-3 w-28">
            <input
                type="text"
                value={item.rate}
                onChange={(e) => onChange({ ...item, rate: e.target.value })}
                className="w-full text-sm text-right bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary"
            />
        </td>
        <td className="py-3 px-3 w-20">
            <input
                type="number"
                value={item.tax}
                onChange={(e) => onChange({ ...item, tax: Number(e.target.value) })}
                className="w-full text-sm text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary"
            />
        </td>
        <td className="py-3 px-3 w-28 text-right">
            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </td>
        <td className="py-3 pl-3 w-10">
            <button onClick={onRemove} className="text-slate-300 hover:text-rose-500 transition-colors">
                <Trash2 className="w-4 h-4" />
            </button>
        </td>
    </tr>
);


export default function Invoicing() {
    const navigate = useNavigate();
    const toast = useToast();
    const [step, setStep] = useState(0);
    const [customer] = useState({
        name: 'Alex Thompson',
        company: 'Global Tech Solutions Inc.',
        address: '401 Innovation Way, Suite 300, San Francisco, CA 94103',
    });

    const [lineItems, setLineItems] = useState([
        { id: 1, description: 'Cloud Infrastructure Maintenance', sub: 'Monthly managed service fee', qty: 1, rate: '$1,100.00', tax: 10, amount: 1320.00 },
        { id: 2, description: '', sub: '', qty: 0, rate: '0.00', tax: 0, amount: 0.00 },
    ]);

    const [submitting, setSubmitting] = useState(false);

    const subtotal = lineItems.reduce((acc, item) => acc + (item.qty * parseFloat(item.rate.replace(/[^0-9.-]+/g, "")) || 0), 0);
    const taxAmount = subtotal * 0.1;
    const discount = 0.00;
    const total = subtotal + taxAmount - discount;

    const updateItem = (idx, newItem) => {
        const copy = [...lineItems];
        copy[idx] = newItem;
        // Auto-calculate amount
        copy[idx].amount = (newItem.qty * parseFloat(newItem.rate.replace(/[^0-9.-]+/g, "")) || 0) * (1 + newItem.tax / 100);
        setLineItems(copy);
    };

    const removeItem = (idx) => {
        setLineItems(lineItems.filter((_, i) => i !== idx));
    };

    const addItem = () => {
        setLineItems([...lineItems, { id: Date.now(), description: '', sub: '', qty: 0, rate: '0.00', tax: 0, amount: 0.00 }]);
    };

    const handleSendInvoice = async () => {
        if (!customer.name) {
            toast('Please select a customer', 'warning');
            return;
        }

        setSubmitting(true);
        try {
            const invoiceData = {
                customerId: 'cust_default', // Placeholder for demo
                customerName: customer.name,
                items: lineItems.filter(item => item.description),
                subtotal,
                tax: taxAmount,
                total,
                status: 'Pending',
                date: new Date().toISOString()
            };

            await api.invoices.create(invoiceData);
            toast('Invoice sent to client!', 'success');
            setTimeout(() => navigate('/sales'), 1200);
        } catch (error) {
            console.error('Failed to send invoice:', error);
            toast(error.message || 'Failed to send invoice', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 pb-12">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white">Create New Invoice</h1>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                    <span className="text-[10px] text-slate-400 w-full sm:w-auto mb-1 sm:mb-0">Draft saved 2 min ago</span>
                    <button onClick={() => window.print()} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                        <Printer className="w-4 h-4" />
                        <span className="hidden xs:inline">Print</span>
                    </button>
                    <button onClick={() => toast('Invoice draft saved', 'success')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                        <Save className="w-4 h-4" />
                        <span className="hidden xs:inline">Save</span>
                    </button>
                    <button
                        onClick={handleSendInvoice}
                        disabled={submitting}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm shadow-primary/20 transition-all disabled:opacity-70"
                    >
                        <Send className="w-4 h-4" />
                        {submitting ? 'Sending...' : 'Send'}
                    </button>
                </div>
            </div>

            {/* ── Stepper ── */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
                <Stepper current={step} />
            </div>

            {/* ── Main Content ── */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Form Panel (3 cols) */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    {/* Customer Details */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <span className="text-primary">👤</span> Customer Details
                            </h3>
                            <button onClick={() => toast('New customer form coming soon', 'info')} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                                <UserPlus className="w-3.5 h-3.5" />
                                Add New Customer
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Search Customer</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Start typing customer name..."
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Currency</label>
                                <select className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary">
                                    <option>USD – United States Dollar</option>
                                    <option>EUR – Euro</option>
                                    <option>GBP – British Pound</option>
                                </select>
                            </div>
                        </div>

                        {/* Selected Customer */}
                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex items-start gap-4 border border-slate-100 dark:border-slate-700">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                AT
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-200">{customer.name}</p>
                                <p className="text-xs text-slate-500">{customer.company}</p>
                                <p className="text-xs text-slate-400 mt-1">{customer.address}</p>
                            </div>
                        </div>
                    </div>

                    {/* Service & Product Items */}
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                        <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-5">
                            <span className="text-primary">📦</span> Service & Product Items
                        </h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[10px] uppercase font-bold text-slate-400 tracking-wider border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="pb-3 pr-3">Item Description</th>
                                        <th className="pb-3 px-3 text-center">Quantity</th>
                                        <th className="pb-3 px-3 text-right">Rate</th>
                                        <th className="pb-3 px-3 text-center">Tax %</th>
                                        <th className="pb-3 px-3 text-right">Amount</th>
                                        <th className="pb-3 pl-3 w-10"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {lineItems.map((item, idx) => (
                                        <LineItemRow
                                            key={item.id}
                                            item={item}
                                            onChange={(updated) => updateItem(idx, updated)}
                                            onRemove={() => removeItem(idx)}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <button onClick={addItem} className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors">
                            <Plus className="w-4 h-4" />
                            Add Line Item
                        </button>
                    </div>

                    {/* Notes & Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                            <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3">Notes / Memo</label>
                            <textarea
                                placeholder="Add a personal message or internal notes..."
                                rows={4}
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                            />
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Subtotal</span>
                                    <span className="font-medium text-slate-800 dark:text-slate-200">${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Tax (10%)</span>
                                    <span className="font-medium text-slate-800 dark:text-slate-200">${taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Discount</span>
                                    <span className="font-medium text-rose-500">-${discount.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3 flex justify-between">
                                    <span className="font-bold text-slate-800 dark:text-white">TOTAL DUE</span>
                                    <span className="text-2xl font-bold text-slate-800 dark:text-white">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between items-center">
                        <button onClick={() => setStep(Math.max(step - 1, 0))} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>
                        <button
                            onClick={() => setStep(Math.min(step + 1, steps.length - 1))}
                            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-md shadow-primary/20 transition-all"
                        >
                            Next: Finalize Details
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Live Preview (2 cols) */}
                <div className="lg:col-span-2">
                    <div className="sticky top-4">
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Preview</span>
                                <div className="flex gap-2">
                                    <button className="text-slate-400 hover:text-slate-600 transition-colors"><Search className="w-4 h-4" /></button>
                                    <button className="text-slate-400 hover:text-slate-600 transition-colors"><Eye className="w-4 h-4" /></button>
                                </div>
                            </div>

                            {/* Invoice Preview */}
                            <div className="p-8 bg-slate-50 dark:bg-slate-800/30">
                                <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8 max-w-sm mx-auto border border-slate-100 dark:border-slate-700">
                                    {/* Preview Header */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                                <FileText className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="font-bold text-xs text-slate-800 dark:text-white">LEGABLY INC.</span>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Invoice</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">#INV-2023-004</p>
                                            <p className="text-[10px] text-slate-500">Oct 24, 2023</p>
                                        </div>
                                    </div>

                                    {/* Preview Bill To */}
                                    <div className="flex justify-between mb-6">
                                        <div>
                                            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1">Bill To</p>
                                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{customer.name}</p>
                                            <p className="text-[10px] text-slate-400 leading-relaxed">Global Tech Solutions Inc.<br />401 Innovation Way, Suite<br />300<br />San Francisco, CA 94103</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-bold text-primary">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                        </div>
                                    </div>

                                    {/* Preview Items */}
                                    <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mb-4">
                                        <div className="flex text-[9px] uppercase text-slate-400 font-bold tracking-wider mb-2">
                                            <span className="flex-1">Description</span>
                                            <span className="w-10 text-center">Qty</span>
                                            <span className="w-16 text-right">Amount</span>
                                        </div>
                                        <div className="flex items-start text-[11px] py-2 border-b border-dashed border-slate-100 dark:border-slate-700">
                                            <span className="flex-1 text-slate-700 dark:text-slate-300 leading-snug">Cloud Infrastructure Maintenance</span>
                                            <span className="w-10 text-center text-slate-500">1</span>
                                            <span className="w-16 text-right font-semibold text-slate-800 dark:text-slate-200">$1,100.00</span>
                                        </div>
                                    </div>

                                    {/* Preview Totals */}
                                    <div className="space-y-1 text-[11px]">
                                        <div className="flex justify-between text-slate-500">
                                            <span>PAYMENT METHOD</span>
                                            <span>Bank Transfer</span>
                                        </div>
                                        <div className="flex justify-between text-slate-500">
                                            <span>Sub Total</span>
                                            <span>$1,100.00</span>
                                        </div>
                                        <div className="flex justify-between text-slate-500">
                                            <span>+Tax (10%)</span>
                                            <span>$120.00</span>
                                        </div>
                                        <div className="flex justify-between font-bold text-slate-800 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-700 mt-2">
                                            <span>Grand Total</span>
                                            <span className="text-primary">${total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Template link */}
                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-center">
                                <button onClick={() => toast('Template editor coming soon', 'info')} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mx-auto">
                                    <Settings2 className="w-3.5 h-3.5" />
                                    Edit Template Design
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
