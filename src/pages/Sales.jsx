import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api';
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
    Loader2
} from 'lucide-react';

const InvoiceRow = ({ id, client, amount, date, status, onAction }) => {
    const statusStyles = {
        Paid: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600",
        Pending: "bg-amber-50 dark:bg-amber-500/10 text-amber-600",
        Overdue: "bg-rose-50 dark:bg-rose-500/10 text-rose-600",
        draft: "bg-slate-50 dark:bg-slate-500/10 text-slate-600"
    };

    const StatusIcon = {
        Paid: CheckCircle2,
        Pending: Clock,
        Overdue: AlertCircle,
        draft: FileText
    }[status] || Clock; // Fallback to Clock if not one of these

    return (
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
            <td className="px-6 py-4">
                <span className="font-medium text-slate-800 dark:text-slate-200">#{id}</span>
            </td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                        {client.substring(0, 2).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{client}</span>
                </div>
            </td>
            <td className="px-6 py-4 text-center text-sm text-slate-500">{date}</td>
            <td className="px-6 py-4 text-right font-bold text-slate-800 dark:text-slate-200">
                {amount}
            </td>
            <td className="px-6 py-4 text-center">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${statusStyles[status] || statusStyles.draft}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status}
                </div>
            </td>
            <td className="px-6 py-4 text-center">
                <button onClick={() => onAction(id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </td>
        </tr>
    );
};

export default function Sales() {
    const navigate = useNavigate();
    const toast = useToast();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalRevenue: 0,
        pendingAmount: 0,
        overdueAmount: 0
    });

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const res = await api.invoices.getAll();
                const data = res?.data || res || [];

                // Map the backend data to match the UI component's expected structure
                const formattedInvoices = data.map(inv => {
                    const id = inv.invoice_number || inv.invoiceNumber || inv.id;
                    const amount = Number(inv.total_amount || inv.totalAmount || 0);
                    const client = inv.customer?.name || inv.customerName || inv.customerId || 'Unknown Client';
                    const date = new Date(inv.issue_date || inv.issueDate || inv.created_at || inv.createdAt).toLocaleDateString();

                    return {
                        id,
                        client,
                        amount: `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                        numericAmount: amount,
                        date,
                        status: inv.status === 'draft' ? 'draft' :
                            inv.status === 'paid' ? 'Paid' :
                                inv.status === 'sent' ? 'Pending' :
                                    inv.status === 'overdue' ? 'Overdue' : 'Pending'
                    };
                });

                // Calculate stats based on formatted invoices
                const newStats = data.reduce((acc, inv) => {
                    const amount = Number(inv.total_amount || inv.totalAmount || 0);
                    const status = (inv.status || '').toLowerCase();
                    if (status === 'paid') {
                        acc.totalRevenue += amount;
                    } else if (status === 'sent' || status === 'draft' || status === 'pending') {
                        acc.pendingAmount += amount;
                    } else if (status === 'overdue') {
                        acc.overdueAmount += amount;
                    }
                    return acc;
                }, { totalRevenue: 0, pendingAmount: 0, overdueAmount: 0 });

                setStats(newStats);
                setInvoices(formattedInvoices);
            } catch (error) {
                console.error("Failed to load invoices", error);
                toast('Failed to load invoices.', 'error');
                setInvoices([]);
            } finally {
                setLoading(false);
            }
        };

        fetchInvoices();
    }, []);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Sales & Invoices</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your invoices and track payments.</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => toast('Sales data exported to CSV', 'success')} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                        <Download className="w-4 h-4" />
                        Export
                    </button>
                    <button onClick={() => navigate('/invoicing')} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm shadow-primary/20 transition-all">
                        <Plus className="w-4 h-4" />
                        Create Invoice
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-primary/5 border border-primary/10 p-6 rounded-xl">
                    <p className="text-primary font-medium text-sm mb-1">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                </div>
                <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 p-6 rounded-xl">
                    <p className="text-amber-600 font-medium text-sm mb-1">Pending Amount</p>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">${stats.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                </div>
                <div className="bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/10 p-6 rounded-xl">
                    <p className="text-rose-600 font-medium text-sm mb-1">Overdue</p>
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white">${stats.overdueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
                </div>
            </div>

            {/* Invoices Table */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search invoices..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button onClick={() => toast('Filter options coming soon', 'info')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <Filter className="w-4 h-4" />
                            Filter
                        </button>
                        <button onClick={() => toast('Column visibility toggled', 'info')} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <FileText className="w-4 h-4" />
                            Columns
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
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
                            {invoices.map((invoice, idx) => (
                                <InvoiceRow key={idx} {...invoice} onAction={(id) => toast(`Viewing invoice #${id}`, 'info')} />
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
                    <span>Showing 1-{invoices.length} of {invoices.length} invoices</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50" disabled>Previous</button>
                        <button onClick={() => toast('No more pages', 'info')} className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50" disabled>Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
