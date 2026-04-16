import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api';
import { exportRowsToPdf } from '../lib/pdfExport';
import { useAuth } from '../context/AuthContext';
import CurrencySelect from '../components/ui/CurrencySelect';
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    FileText,
    Download,
    CheckCircle2,
    Clock,
    AlertCircle,
    Loader2,
    RefreshCw
} from 'lucide-react';

const PENDING_SALES_INVOICES_KEY = 'nanobooks_pending_sales_invoices';

const normalizeInvoiceStatus = (raw) => {
    const rawStatus = (raw || 'pending').toLowerCase();
    if (rawStatus === 'draft') return { rawStatus, status: 'draft' };
    if (rawStatus === 'paid') return { rawStatus, status: 'Paid' };
    if (rawStatus === 'overdue') return { rawStatus, status: 'Overdue' };
    return { rawStatus, status: 'Pending' };
};

const statusStyles = {
    Paid: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600',
    Pending: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    Overdue: 'bg-rose-50 dark:bg-rose-500/10 text-rose-600',
    draft: 'bg-slate-50 dark:bg-slate-500/10 text-slate-600'
};

const statusIcons = {
    Paid: CheckCircle2,
    Pending: Clock,
    Overdue: AlertCircle,
    draft: FileText
};

const InvoiceRow = ({ invoice, onAction, actionLoadingId, formatCurrency }) => {
    const StatusIcon = statusIcons[invoice.status] || Clock;

    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
            <td className="px-6 py-4">
                <span className="font-medium text-slate-800 dark:text-slate-200">#{invoice.displayId}</span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {invoice.client.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{invoice.client}</span>
                </div>
            </td>
            <td className="px-6 py-4 text-center text-sm text-slate-500">{invoice.date}</td>
            <td className="px-6 py-4 text-right font-bold text-slate-800 dark:text-slate-200">
                {formatCurrency(invoice.amount)}
            </td>
            <td className="px-6 py-4 text-center">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${statusStyles[invoice.status] || statusStyles.draft}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {invoice.status}
                </div>
            </td>
            <td className="px-6 py-4 text-center">
                <button onClick={() => onAction(invoice)} disabled={actionLoadingId === invoice.backendId} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors disabled:opacity-60">
                    {actionLoadingId === invoice.backendId ? <Loader2 className="w-5 h-5 animate-spin" /> : <MoreHorizontal className="w-5 h-5" />}
                </button>
            </td>
        </tr>
    );
};

export default function Sales() {
    const navigate = useNavigate();
    const toast = useToast();
    const { formatCurrency } = useAuth();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [stats, setStats] = useState({ totalRevenue: 0, pendingAmount: 0, overdueAmount: 0 });
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            // Fetch invoices first
            const res = await api.invoices.getAll();
            const data = res?.data || res || [];

            // Attempt to fetch customers but don't fail if it fails
            let customerMap = {};
            try {
                const custRes = await api.customers.getAll();
                const custData = custRes?.data || custRes || [];
                customerMap = (Array.isArray(custData) ? custData : []).reduce((acc, c) => {
                    if (c && c.id) acc[c.id] = c.name;
                    return acc;
                }, {});
            } catch (custErr) {
                console.error('Failed to fetch customers:', custErr);
            }

            const formatted = data.map((inv) => {
                const amount = Number(inv.total_amount || inv.totalAmount || 0);
                const { rawStatus, status } = normalizeInvoiceStatus(inv.status);
                
                const customerId = inv.customer_id || inv.customerId || inv.customer;
                const customerNameFromData = inv.customer_name || inv.customerName;
                
                const isId = (val) => {
                    if (typeof val !== 'string') return false;
                    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val) || /^\d+$/.test(val);
                };
                
                let clientName = 'Unknown Client';
                if (customerNameFromData && !isId(customerNameFromData)) {
                    clientName = customerNameFromData;
                } else if (customerId && customerMap[customerId]) {
                    clientName = customerMap[customerId];
                } else if (customerNameFromData && customerMap[customerNameFromData]) {
                    clientName = customerMap[customerNameFromData];
                }

                return {
                    backendId: inv.id,
                    displayId: inv.invoice_number || inv.invoiceNumber || inv.id,
                    client: clientName,
                    amount,
                    date: new Date(inv.issue_date || inv.issueDate || inv.created_at || inv.createdAt || Date.now()).toLocaleDateString(),
                    rawStatus,
                    status
                };
            });

            const pendingLocal = JSON.parse(localStorage.getItem(PENDING_SALES_INVOICES_KEY) || '[]');
            const existingIds = new Set(formatted.map((inv) => inv.backendId || inv.displayId));
            const merged = [...formatted];

            pendingLocal.forEach((item) => {
                const key = item.backendId || item.displayId;
                if (!key || existingIds.has(key)) return;
                const normalized = normalizeInvoiceStatus(item.status);
                merged.unshift({
                    backendId: item.backendId || item.displayId,
                    displayId: item.displayId || item.backendId,
                    client: item.client || 'Unknown Client',
                    amount: Number(item.amount || 0),
                    date: item.date || new Date().toLocaleDateString(),
                    rawStatus: normalized.rawStatus,
                    status: normalized.status
                });
            });

            const computed = data.reduce((acc, inv) => {
                const amount = Number(inv.total_amount || inv.totalAmount || 0);
                const status = (inv.status || '').toLowerCase();
                if (status === 'paid') acc.totalRevenue += amount;
                else if (status === 'overdue') acc.overdueAmount += amount;
                else acc.pendingAmount += amount;
                return acc;
            }, { totalRevenue: 0, pendingAmount: 0, overdueAmount: 0 });

            setInvoices(merged);
            setStats(computed);

            if (pendingLocal.length > 0) {
                const mergedIds = new Set(data.map((inv) => inv.id));
                const remaining = pendingLocal.filter((item) => !item.backendId || !mergedIds.has(item.backendId));
                localStorage.setItem(PENDING_SALES_INVOICES_KEY, JSON.stringify(remaining));
            }
        } catch (error) {
            console.error('Failed to load invoices:', error);
            toast(error.message || 'Failed to load invoices', 'error');
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    const filteredInvoices = useMemo(() => {
        return invoices.filter((inv) => {
            const matchesSearch = !searchTerm
                || inv.client.toLowerCase().includes(searchTerm.toLowerCase())
                || String(inv.displayId).toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' || inv.status.toLowerCase() === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [invoices, searchTerm, statusFilter]);

    const handleQuickAction = async (invoice) => {
        if (!invoice.backendId) {
            toast('Cannot run action for this invoice', 'warning');
            return;
        }

        const actionLabel = invoice.status === 'draft'
            ? 'send this draft invoice'
            : invoice.status === 'Pending' || invoice.status === 'Overdue'
                ? 'mark this invoice as paid'
                : 'refresh this invoice';
        if (!window.confirm(`Are you sure you want to ${actionLabel}?`)) return;

        setActionLoadingId(invoice.backendId);
try {
            if (invoice.status === 'draft') {
                await api.invoices.send(invoice.backendId);
                toast(`Invoice #${invoice.displayId} sent`, 'success');
            } else if (invoice.status === 'Pending' || invoice.status === 'Overdue') {
                await api.invoices.markAsPaid(invoice.backendId);
                toast(`Invoice #${invoice.displayId} marked as paid`, 'success');
            } else {
                await api.invoices.getOne(invoice.backendId);
                toast(`Invoice #${invoice.displayId} is already paid`, 'info');
            }
            fetchInvoices();
        } catch (error) {
            toast(error.message || 'Invoice action failed', 'error');
        }
    };

    const handleExport = () => {
        const header = ['invoice_id', 'client', 'date', 'amount', 'status'];
        const rows = filteredInvoices.map((inv) => [inv.displayId, inv.client, inv.date, inv.amount, inv.status]);
        exportRowsToPdf({
            title: 'Invoices Export',
            headers: header,
            rows,
            filename: 'invoices.pdf'
        });
        toast('Invoices exported as PDF', 'success');
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Sales & Invoices</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your invoices and track payments.</p>
                </div>
                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                    <CurrencySelect />
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button onClick={() => navigate('/invoicing')} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm shadow-primary/20 transition-all">
                        <Plus className="w-4 h-4" />
                        Create Invoice
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-primary/5 border border-primary/10 p-6 rounded-xl">
                    <p className="text-primary font-medium text-sm mb-1">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(stats.totalRevenue)}</h3>
                </div>
                <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 p-6 rounded-xl">
                    <p className="text-amber-600 font-medium text-sm mb-1">Pending Amount</p>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(stats.pendingAmount)}</h3>
                </div>
                <div className="bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 p-6 rounded-xl">
                    <p className="text-rose-600 font-medium text-sm mb-1">Overdue</p>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(stats.overdueAmount)}</h3>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search invoices..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => setStatusFilter((s) => s === 'all' ? 'pending' : s === 'pending' ? 'paid' : s === 'paid' ? 'overdue' : s === 'overdue' ? 'draft' : 'all')}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <Filter className="w-4 h-4" />
                            Filter: {statusFilter}
                        </button>
                        <button onClick={fetchInvoices} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <RefreshCw className="w-4 h-4" />
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredInvoices.map((invoice) => {
                        const MobileStatusIcon = statusIcons[invoice.status] || Clock;
                        return (
                        <div key={invoice.backendId || invoice.displayId} className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">#{invoice.displayId}</p>
                                    <p className="text-xs text-slate-500 truncate">{invoice.client}</p>
                                </div>
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{formatCurrency(invoice.amount)}</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-slate-500">
                                <span>{invoice.date}</span>
                                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusStyles[invoice.status] || statusStyles.draft}`}>
                                    <MobileStatusIcon className="w-3.5 h-3.5" />
                                    {invoice.status}
                                </div>
                            </div>
                            <button
                                onClick={() => handleQuickAction(invoice)}
                                disabled={actionLoadingId === invoice.backendId}
                                className="w-full py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-60"
                            >
                                {actionLoadingId === invoice.backendId ? 'Processing...' : 'Run Action'}
                            </button>
                        </div>
                    )})}
                    {filteredInvoices.length === 0 && (
                        <div className="px-6 py-10 text-center text-slate-500">No invoices found</div>
                    )}
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left min-w-[760px]">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Invoice ID</th>
                                <th className="px-6 py-4">Client</th>
                                <th className="px-6 py-4 text-center">Date</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredInvoices.map((invoice) => (
                                <InvoiceRow key={invoice.backendId || invoice.displayId} invoice={invoice} onAction={handleQuickAction} actionLoadingId={actionLoadingId} formatCurrency={formatCurrency} />
                            ))}
                            {filteredInvoices.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-slate-500">No invoices found</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
                    <span>Showing {filteredInvoices.length} of {invoices.length} invoices</span>
                </div>
            </div>
        </div>
    );
}
