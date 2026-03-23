import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
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
    Printer,
    X,
    Loader2,
    User,
    Mail,
    Phone,
    MapPin
} from 'lucide-react';

const PENDING_SALES_INVOICES_KEY = 'nanobooks_pending_sales_invoices';

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

/* ─── Add Customer Modal ─── */
const AddCustomerModal = ({ isOpen, onClose, onCustomerCreated, toast }) => {
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        billingAddress: '',
        shippingAddress: ''
    });

    const update = (field, value) => setForm(p => ({ ...p, [field]: value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.name || !form.email) {
            toast('Name and Email are required', 'warning');
            return;
        }

        setSaving(true);
        try {
            const res = await api.customers.create(form);
            const created = res?.data || res;
            toast('Customer created successfully!', 'success');
            onCustomerCreated(created);
            setForm({ name: '', email: '', phone: '', billingAddress: '', shippingAddress: '' });
            onClose();
        } catch (error) {
            console.error('Failed to create customer:', error);
            toast(error.message || 'Failed to create customer', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-md mx-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl animate-in fade-in zoom-in-95">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                            <UserPlus className="w-4 h-4 text-primary" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-white">Add New Customer</h3>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Customer Name *</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => update('name', e.target.value)}
                                placeholder="e.g. John Doe"
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Email Address *</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => update('email', e.target.value)}
                                placeholder="e.g. john@company.com"
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Phone */}
                    <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Phone</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="tel"
                                value={form.phone}
                                onChange={(e) => update('phone', e.target.value)}
                                placeholder="e.g. +1 555 123 4567"
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>

                    {/* Billing Address */}
                    <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Billing Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                            <textarea
                                value={form.billingAddress}
                                onChange={(e) => update('billingAddress', e.target.value)}
                                placeholder="Street address, city, state, zip"
                                rows={2}
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                            />
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                        <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">Shipping Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
                            <textarea
                                value={form.shippingAddress}
                                onChange={(e) => update('shippingAddress', e.target.value)}
                                placeholder="Same as billing or different address"
                                rows={2}
                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                            />
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-200 dark:border-slate-800">
                    <button onClick={onClose} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm shadow-primary/20 transition-all disabled:opacity-70"
                    >
                        {saving ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                        ) : (
                            <><UserPlus className="w-4 h-4" /> Add Customer</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─── Line Item Row ─── */
const LineItemRow = ({ item, onChange, onRemove, products, formatCurrency }) => {
    const [search, setSearch] = useState(item.description || '');
    const [showProducts, setShowProducts] = useState(false);

    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (p) => {
        onChange({
            ...item,
            description: p.name,
            rate: p.price.toString(),
            sub: p.sku
        });
        setSearch(p.name);
        setShowProducts(false);
    };

    return (
        <tr className="border-b border-slate-100 dark:border-slate-800 last:border-0">
            <td className="py-3 pr-3 relative">
                <div>
                    <input
                        type="text"
                        value={search}
                        onFocus={() => setShowProducts(true)}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            onChange({ ...item, description: e.target.value });
                        }}
                        placeholder="Select or type an item"
                        className="w-full text-sm font-medium text-slate-800 dark:text-slate-200 bg-transparent border-0 focus:outline-none placeholder:text-slate-400"
                    />
                    {item.sub && <p className="text-[11px] text-slate-400 mt-0.5">{item.sub}</p>}

                    {showProducts && search && (
                        <div className="absolute z-30 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                            {filtered.length > 0 ? filtered.map(p => (
                                <button
                                    key={p.id}
                                    onClick={() => handleSelect(p)}
                                    className="w-full text-left px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 last:border-0"
                                >
                                    <div>
                                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{p.name}</p>
                                        <p className="text-[10px] text-slate-400">{p.sku}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-primary">{formatCurrency(p.price)}</p>
                                        <p className="text-[9px] text-slate-400">{p.quantity} in stock</p>
                                    </div>
                                </button>
                            )) : (
                                <div className="px-3 py-2 text-xs text-slate-400 italic">No products found</div>
                            )}
                        </div>
                    )}
                </div>
                {/* Overlay to close products dropdown */}
                {showProducts && <div className="fixed inset-0 z-20" onClick={() => setShowProducts(false)} />}
            </td>
            <td className="py-3 px-3 w-20 relative z-10">
                <input
                    type="number"
                    value={item.qty}
                    onChange={(e) => onChange({ ...item, qty: Math.max(0, Number(e.target.value)) })}
                    className="w-full text-sm text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1.5 focus:outline-none focus:border-primary"
                />
            </td>
            <td className="py-3 px-3 w-40 md:w-28 relative z-10">
                <input
                    type="text"
                    inputMode="decimal"
                    value={item.rate}
                    onChange={(e) => onChange({ ...item, rate: e.target.value })}
                    className="w-full min-w-[8.5rem] md:min-w-0 text-base md:text-sm text-right bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 md:px-2 md:py-1.5 focus:outline-none focus:border-primary"
                />
            </td>
            <td className="py-3 px-3 w-28 md:w-20 relative z-10">
                <input
                    type="number"
                    inputMode="decimal"
                    value={item.tax}
                    onChange={(e) => onChange({ ...item, tax: Number(e.target.value) })}
                    className="w-full min-w-[6.5rem] md:min-w-0 text-base md:text-sm text-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 md:px-2 md:py-1.5 focus:outline-none focus:border-primary"
                />
            </td>
            <td className="py-3 px-3 w-28 text-right relative z-10">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatCurrency(item.amount)}</span>
            </td>
            <td className="py-3 pl-3 w-10 relative z-10">
                <button onClick={onRemove} className="text-slate-300 hover:text-rose-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                </button>
            </td>
        </tr>
    );
};


export default function Invoicing() {
    const navigate = useNavigate();
    const toast = useToast();
    const { user, currency, setCurrency, formatCurrency } = useAuth();
    const [step, setStep] = useState(0);
    const [showAddCustomer, setShowAddCustomer] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [customerSearch, setCustomerSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [customer, setCustomer] = useState({
        id: '',
        name: '',
        company: '',
        email: '',
        address: '',
    });

    const [lineItems, setLineItems] = useState([
        { id: Date.now(), description: '', sub: '', qty: 0, rate: '0.00', tax: 0, amount: 0.00 },
    ]);

    const [submitting, setSubmitting] = useState(false);
    const [inventoryProducts, setInventoryProducts] = useState([]);

    const companyNameFromUser =
        user?.companyName ||
        user?.company_name ||
        user?.company ||
        user?.organizationName ||
        user?.organization_name ||
        user?.organization?.name ||
        '';
    const displayCompanyName = companyNameFromUser || 'NanoBooks';

    // Fetch customers and products on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [custRes, prodRes] = await Promise.all([
                    api.customers.getAll(),
                    api.inventory.getAll()
                ]);

                const custData = custRes?.data || custRes || [];
                setCustomers(Array.isArray(custData) ? custData : []);

                const prodData = prodRes?.data || prodRes || [];
                setInventoryProducts(Array.isArray(prodData) ? prodData : []);
            } catch (err) {
                console.error('Failed to load data:', err);
            }
        };
        fetchData();
    }, []);

    const filteredCustomers = customers.filter(c =>
        (c.name || '').toLowerCase().includes(customerSearch.toLowerCase()) ||
        (c.email || '').toLowerCase().includes(customerSearch.toLowerCase())
    );

    const selectCustomer = (c) => {
        setCustomer({
            id: c.id,
            name: c.name || '',
            company: c.company || c.email || '',
            email: c.email || '',
            address: c.billingAddress || c.billing_address || '',
        });
        setCustomerSearch(c.name || '');
        setShowDropdown(false);
    };

    const handleCustomerCreated = (created) => {
        setCustomers(prev => [created, ...prev]);
        selectCustomer(created);
    };

    const lineItemsWithTotals = lineItems.map((item) => {
        const qty = Number(item.qty) || 0;
        const rate = typeof item.rate === 'string' ? parseFloat(item.rate.replace(/[^0-9.-]+/g, "")) || 0 : Number(item.rate || 0);
        const taxRate = Number(item.tax) || 0;
        const lineSubtotal = qty * rate;
        const lineTax = lineSubtotal * (taxRate / 100);
        return {
            ...item,
            lineSubtotal,
            lineTax,
            computedAmount: lineSubtotal + lineTax
        };
    });

    const subtotal = lineItemsWithTotals.reduce((acc, item) => acc + item.lineSubtotal, 0);
    const taxAmount = lineItemsWithTotals.reduce((acc, item) => acc + item.lineTax, 0);
    const effectiveTaxRate = subtotal > 0 ? (taxAmount / subtotal) * 100 : 0;
    const discount = 0.00;
    const total = subtotal + taxAmount - discount;

    const updateItem = (idx, newItem) => {
        const copy = [...lineItems];
        copy[idx] = newItem;
        // Auto-calculate amount
        const qty = Number(newItem.qty) || 0;
        const rate = typeof newItem.rate === 'string' ? parseFloat(newItem.rate.replace(/[^0-9.-]+/g, "")) || 0 : Number(newItem.rate || 0);
        const taxRate = Number(newItem.tax) || 0;
        copy[idx].amount = (qty * rate) * (1 + taxRate / 100);
        setLineItems(copy);
    };

    const removeItem = (idx) => {
        setLineItems(lineItems.filter((_, i) => i !== idx));
    };

    const addItem = () => {
        setLineItems([...lineItems, { id: Date.now(), description: '', sub: '', qty: 0, rate: '0.00', tax: 0, amount: 0.00 }]);
    };

    const handleSendInvoice = async () => {
        if (!customer.id) {
            toast('Please select a customer', 'warning');
            return;
        }

        const validItems = lineItems
            .filter(item => item.description.trim() && Number(item.qty) > 0)
            .map(item => ({
                description: item.description,
                quantity: Number(item.qty),
                rate: typeof item.rate === 'string' ? parseFloat(item.rate.replace(/[^0-9.-]+/g, "")) : item.rate,
                taxPercentage: Number(item.tax)
            }));

        if (validItems.length === 0) {
            toast('Please add at least one valid item with quantity > 0', 'warning');
            return;
        }

        setSubmitting(true);
        try {
            const invoiceData = {
                customerId: customer.id,
                customerName: customer.name,
                invoiceNumber: `INV-${Date.now().toString().slice(-4)}`,
                issueDate: new Date().toISOString(),
                dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
                currency: currency,
                items: validItems,
                discount: 0,
                notes: '',
                taxTotal: taxAmount,
                status: 'draft',
                subtotal,
                totalAmount: total
            };



            const res = await api.invoices.create(invoiceData);
            const createdInvoice = res?.data || res;

            const pendingLocal = JSON.parse(localStorage.getItem(PENDING_SALES_INVOICES_KEY) || '[]');
            const localInvoice = {
                backendId: createdInvoice?.id || null,
                displayId: createdInvoice?.invoice_number || invoiceData.invoiceNumber,
                client: customer.name,
                amount: total,
                status: createdInvoice?.status === 'paid' ? 'paid' : 'pending',
                date: new Date(invoiceData.issueDate).toLocaleDateString()
            };
            localStorage.setItem(PENDING_SALES_INVOICES_KEY, JSON.stringify([localInvoice, ...pendingLocal].slice(0, 30)));

            if (createdInvoice && createdInvoice.id) {
                await api.invoices.send(createdInvoice.id);
                toast('Invoice created and sent successfully!', 'success');
            } else {
                toast('Invoice created successfully!', 'success');
            }

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
            {/* ── Add Customer Modal ── */}
            <AddCustomerModal
                isOpen={showAddCustomer}
                onClose={() => setShowAddCustomer(false)}
                onCustomerCreated={handleCustomerCreated}
                toast={toast}
            />

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
                    <button onClick={handleSendInvoice} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
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
                            <button onClick={() => setShowAddCustomer(true)} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                                <UserPlus className="w-3.5 h-3.5" />
                                Add New Customer
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                            <div className="relative">
                                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Search Customer</label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        value={customerSearch}
                                        onChange={(e) => {
                                            setCustomerSearch(e.target.value);
                                            setShowDropdown(true);
                                        }}
                                        onFocus={() => setShowDropdown(true)}
                                        placeholder="Start typing customer name..."
                                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                                {/* Customer Dropdown */}
                                {showDropdown && customerSearch && (
                                    <div className="absolute z-20 left-0 right-0 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                                        {filteredCustomers.length > 0 ? filteredCustomers.map(c => (
                                            <button
                                                key={c.id}
                                                onClick={() => selectCustomer(c)}
                                                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 last:border-0"
                                            >
                                                <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-[10px] shrink-0">
                                                    {(c.name || '?').substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{c.name}</p>
                                                    <p className="text-[11px] text-slate-400">{c.email}</p>
                                                </div>
                                            </button>
                                        )) : (
                                            <div className="px-4 py-3 text-sm text-slate-400 text-center">
                                                No customers found.{' '}
                                                <button onClick={() => { setShowDropdown(false); setShowAddCustomer(true); }} className="text-primary hover:underline font-medium">Create one</button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Currency</label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary">
                                    <option value="USD">USD – United States Dollar</option>
                                    <option value="EUR">EUR – Euro</option>
                                    <option value="GBP">GBP – British Pound</option>
                                    <option value="NGN">NGN – Nigerian Naira</option>
                                </select>
                            </div>
                        </div>

                        {/* Selected Customer */}
                        {customer.name ? (
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex items-start gap-4 border border-slate-100 dark:border-slate-700">
                                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                    {customer.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200">{customer.name}</p>
                                    <p className="text-xs text-slate-500">{customer.email || customer.company}</p>
                                    {customer.address && <p className="text-xs text-slate-400 mt-1">{customer.address}</p>}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-700">
                                <p className="text-sm text-slate-400">Search for a customer above or <button onClick={() => setShowAddCustomer(true)} className="text-primary hover:underline font-medium">add a new one</button></p>
                            </div>
                        )}
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
                                            products={inventoryProducts}
                                            onChange={(updated) => updateItem(idx, updated)}
                                            onRemove={() => removeItem(idx)}
                                            formatCurrency={formatCurrency}
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
                                    <span className="font-medium text-slate-800 dark:text-slate-200">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Tax (10%)</span>
                                    <span className="font-medium text-slate-800 dark:text-slate-200">{formatCurrency(taxAmount)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Discount</span>
                                    <span className="font-medium text-rose-500">-{formatCurrency(discount)}</span>
                                </div>
                                <div className="border-t border-slate-200 dark:border-slate-700 pt-3 mt-3 flex justify-between">
                                    <span className="font-bold text-slate-800 dark:text-white">TOTAL DUE</span>
                                    <span className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(total)}</span>
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
                            onClick={() => {
                                if (step === steps.length - 1) {
                                    handleSendInvoice();
                                } else {
                                    setStep(step + 1);
                                }
                            }}
                            disabled={submitting}
                            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-md shadow-primary/20 transition-all disabled:opacity-70"
                        >
                            {submitting ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Finalizing...
                                </>
                            ) : step === steps.length - 1 ? (
                                <>
                                    Finalize & Send Invoice
                                    <Send className="w-4 h-4" />
                                </>
                            ) : (
                                <>
                                    Next: {steps[step + 1]}
                                    <ChevronRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Live Preview (2 cols) */}
                <div className="lg:col-span-2 min-w-0">
                    <div className="sticky top-4 min-w-0">
                        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-w-0">
                            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Preview</span>
                                <div className="flex gap-2">
                                    <button className="text-slate-400 hover:text-slate-600 transition-colors"><Search className="w-4 h-4" /></button>
                                    <button className="text-slate-400 hover:text-slate-600 transition-colors"><Eye className="w-4 h-4" /></button>
                                </div>
                            </div>

                            {/* Invoice Preview */}
                            <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-800/30 overflow-x-hidden">
                                <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-4 sm:p-8 w-full max-w-sm mx-auto border border-slate-100 dark:border-slate-700 min-w-0 overflow-hidden">
                                    {/* Preview Header */}
                                    <div className="flex justify-between items-start gap-3 mb-6 min-w-0">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                                <FileText className="w-4 h-4 text-white" />
                                            </div>
                                            <span className="font-bold text-xs text-slate-800 dark:text-white break-words">{displayCompanyName}</span>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-[10px] uppercase text-slate-400 font-bold tracking-widest">Invoice</p>
                                            <p className="text-[10px] text-slate-500 mt-0.5">#INV-2023-004</p>
                                            <p className="text-[10px] text-slate-500">Oct 24, 2023</p>
                                        </div>
                                    </div>

                                    {/* Preview Bill To */}
                                    <div className="flex justify-between gap-3 mb-6 min-w-0">
                                        <div className="min-w-0">
                                            <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1">Bill To</p>
                                            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 break-words">{customer.name || 'Customer Name'}</p>
                                            <p className="text-[10px] text-slate-400 leading-relaxed break-words">{customer.address || customer.email || 'Address pending...'}</p>
                                        </div>
                                        <div className="text-right shrink-0 max-w-[45%]">
                                            <p className="text-lg sm:text-xl font-bold text-primary break-all">{formatCurrency(total)}</p>
                                        </div>
                                    </div>

                                    {/* Preview Items */}
                                    <div className="border-t border-slate-100 dark:border-slate-700 pt-4 mb-4">
                                        <div className="flex text-[9px] uppercase text-slate-400 font-bold tracking-wider mb-2">
                                            <span className="flex-1">Description</span>
                                            <span className="w-10 text-center">Qty</span>
                                            <span className="w-16 text-right">Amount</span>
                                        </div>
                                        {lineItemsWithTotals.filter(i => i.description || i.computedAmount > 0).map((item, idx) => (
                                            <div key={idx} className="flex items-start text-[11px] py-2 border-b border-dashed border-slate-100 dark:border-slate-700 min-w-0">
                                                <span className="flex-1 min-w-0 text-slate-700 dark:text-slate-300 leading-snug break-words pr-2">{item.description || 'New Item'}</span>
                                                <span className="w-10 text-center text-slate-500 shrink-0">{item.qty}</span>
                                                <span className="w-16 text-right font-semibold text-slate-800 dark:text-slate-200 shrink-0 break-all">{formatCurrency(item.computedAmount)}</span>
                                            </div>
                                        ))}
                                        {lineItemsWithTotals.filter(i => i.description || i.computedAmount > 0).length === 0 && (
                                            <div className="flex items-start text-[11px] py-2 border-b border-dashed border-slate-100 dark:border-slate-700">
                                                <span className="flex-1 text-slate-400 italic">No items added</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Preview Totals */}
                                    <div className="space-y-1 text-[11px]">
                                        <div className="flex justify-between gap-2 text-slate-500">
                                            <span>PAYMENT METHOD</span>
                                            <span className="text-right break-words">Bank Transfer</span>
                                        </div>
                                        <div className="flex justify-between gap-2 text-slate-500">
                                            <span>Sub Total</span>
                                            <span className="text-right break-all">{formatCurrency(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between gap-2 text-slate-500">
                                            <span>+Tax ({effectiveTaxRate.toFixed(2)}%)</span>
                                            <span className="text-right break-all">{formatCurrency(taxAmount)}</span>
                                        </div>
                                        <div className="flex justify-between gap-2 font-bold text-slate-800 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-700 mt-2">
                                            <span>Grand Total</span>
                                            <span className="text-primary text-right break-all">{formatCurrency(total)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Template link */}
                            <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-center">
                                <button onClick={() => window.print()} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mx-auto">
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


