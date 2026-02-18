import React, { useState } from 'react';
import { useToast } from '../components/ui/Toast';
import {
    Search,
    Download,
    Filter,
    CheckCircle2,
    AlertTriangle,
    XCircle,
    Sparkles,
    ShieldCheck,
    BookOpen,
    ArrowRight,
    Cpu,
    Lock,
    FileCheck
} from 'lucide-react';

/* ─── stat cards ─── */
const StatCard = ({ label, value, sub, variant = 'default' }) => {
    const border = {
        default: 'border-slate-200 dark:border-slate-800',
        danger: 'border-rose-200 dark:border-rose-800',
        success: 'border-emerald-200 dark:border-emerald-800',
    }[variant];

    const valColor = {
        default: 'text-slate-800 dark:text-white',
        danger: 'text-rose-600',
        success: 'text-emerald-600',
    }[variant];

    return (
        <div className={`bg-white dark:bg-slate-900 p-5 rounded-xl border ${border} shadow-sm flex flex-col gap-1`}>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{label}</span>
            <span className={`text-2xl font-bold ${valColor}`}>{value}</span>
            {sub && <span className="text-xs text-slate-400 mt-0.5">{sub}</span>}
        </div>
    );
};

/* ─── status badge ─── */
const StatusBadge = ({ type }) => {
    const cfg = {
        exact: { bg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600', label: 'Exact Match', icon: CheckCircle2 },
        training: { bg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600', label: 'Training Done', icon: Sparkles },
        none: { bg: 'bg-slate-100 dark:bg-slate-800 text-slate-500', label: 'No Match', icon: XCircle },
        suggest: { bg: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600', label: 'Suggested', icon: Sparkles },
    }[type];

    const Icon = cfg.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${cfg.bg}`}>
            <Icon className="w-3 h-3" /> {cfg.label}
        </span>
    );
};

/* ─── action buttons ─── */
const ActionBtn = ({ label, variant = 'primary', onClick }) => {
    const styles = {
        primary: 'bg-primary text-white hover:bg-primary/90',
        outline: 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
        green: 'bg-emerald-500 text-white hover:bg-emerald-600',
        orange: 'border border-amber-300 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/10',
    }[variant];

    return (
        <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${styles}`}>
            {label}
        </button>
    );
};

/* ─── transaction row ─── */
const ReconcileRow = ({ date, bankName, bankSub, bankAmount, status, ledgerName, ledgerSub, ledgerAmount, actions, onAction }) => (
    <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
        {/* Date */}
        <td className="pl-6 py-5 text-xs font-bold text-slate-400 uppercase whitespace-nowrap align-top pt-6">
            {date}
        </td>

        {/* Bank Feed */}
        <td className="px-4 py-5">
            <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{bankName}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{bankSub}</p>
            </div>
        </td>
        <td className="px-4 py-5 text-right">
            <span className={`font-bold text-sm ${bankAmount.startsWith('+') ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-200'}`}>
                {bankAmount}
            </span>
        </td>

        {/* Status + Actions */}
        <td className="px-4 py-5">
            <div className="flex flex-col items-center gap-2">
                <StatusBadge type={status} />
                <div className="flex gap-1.5">
                    {actions.map((a, i) => (
                        <ActionBtn key={i} label={a.label} variant={a.variant} onClick={() => onAction(a.label, bankName)} />
                    ))}
                </div>
            </div>
        </td>

        {/* Ledger */}
        <td className="px-4 py-5">
            {ledgerName ? (
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{ledgerName}</p>
                    {ledgerSub && <p className="text-[11px] text-slate-400 mt-0.5">{ledgerSub}</p>}
                </div>
            ) : (
                <p className="text-xs text-slate-400 italic">Select which transaction matches this bank entry.</p>
            )}
        </td>
        <td className="pr-6 py-5 text-right">
            {ledgerAmount ? (
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{ledgerAmount}</span>
            ) : (
                <a href="#" onClick={(e) => { e.preventDefault(); onAction('Find matches', bankName); }} className="text-xs text-primary font-semibold hover:underline">Find other matches</a>
            )}
        </td>
    </tr>
);

/* ─── feature card ─── */
/* eslint-disable react/prop-types */
const FeatureCard = ({ icon: Icon, title, description }) => (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5" />
        </div>
        <div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">{title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{description}</p>
        </div>
    </div>
);

/* ═══════════════════ MAIN PAGE ═══════════════════ */
export default function Banking() {
    const toast = useToast();
    const [tab, setTab] = useState('unreconciled');

    const transactions = [
        {
            date: 'OCT 24',
            bankName: 'Starbucks Coffee #2241',
            bankSub: 'VISA **** • 4087',
            bankAmount: '$12.50',
            status: 'exact',
            actions: [{ label: 'Match', variant: 'green' }],
            ledgerName: 'Expense: Starbucks',
            ledgerSub: 'Posted by · Sync on Oct 24',
            ledgerAmount: '$12.50',
        },
        {
            date: 'OCT 24',
            bankName: 'Adobe Creative Cloud Subscription',
            bankSub: 'VISA **** • 4087',
            bankAmount: '$52.99',
            status: 'training',
            actions: [{ label: 'View', variant: 'orange' }, { label: 'Exclude', variant: 'outline' }],
            ledgerName: null,
            ledgerSub: null,
            ledgerAmount: null,
        },
        {
            date: 'OCT 22',
            bankName: 'Deposit: Stripe Transfer #77291',
            bankSub: 'ACH Receiving',
            bankAmount: '+$1,500.00',
            status: 'exact',
            actions: [{ label: 'Match', variant: 'green' }],
            ledgerName: 'Invoice Payment: #INV-2023-004',
            ledgerSub: 'Acme Corp · Oct 20, 2023',
            ledgerAmount: '$1,500.00',
        },
        {
            date: 'OCT 21',
            bankName: 'Amazon.com Marketplace',
            bankSub: 'VISA **** • 4087',
            bankAmount: '$84.22',
            status: 'none',
            actions: [{ label: 'Add Transaction', variant: 'primary' }],
            ledgerName: "We couldn't find a record of this in your books.",
            ledgerSub: null,
            ledgerAmount: null,
        },
        {
            date: 'OCT 20',
            bankName: 'Apple Store - MacBook Pro 14',
            bankSub: 'VISA **** • 4087',
            bankAmount: '$2,118.94',
            status: 'suggest',
            actions: [{ label: 'Match', variant: 'green' }],
            ledgerName: 'Fixed Asset: Office Equipment',
            ledgerSub: 'Manual · Approved',
            ledgerAmount: '$2,118.94',
        },
    ];

    return (
        <div className="flex flex-col gap-8 pb-12">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Bank Reconciliation</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Business Checking Account (...4482)</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase">Connected</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => toast('Reconciliation history loaded', 'info')} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
                        <BookOpen className="w-4 h-4" />
                        Reconciliation History
                    </button>
                    <button onClick={() => toast('Reconciliation finalized!', 'success')} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm shadow-primary/20 transition-all">
                        Finish Now
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard label="Statement Balance" value="$42,850.32" sub="Updated 7 hours ago" />
                <StatCard label="In-Book's Balance" value="$41,210.12" sub="Pending reconciliation" />
                <StatCard label="Difference" value="$1,640.20" sub="4 transactions remaining" variant="danger" />
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Progress</span>
                    <span className="text-2xl font-bold text-emerald-600">78%</span>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: '78%' }}></div>
                    </div>
                </div>
            </div>

            {/* ── Filter Bar ── */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search transactions..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setTab('unreconciled')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${tab === 'unreconciled' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Unreconciled
                    </button>
                    <button
                        onClick={() => setTab('all')}
                        className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${tab === 'all' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        All Transactions
                    </button>
                    <div className="hidden sm:block w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                    <button onClick={() => toast('Filter options coming soon', 'info')} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <Filter className="w-4 h-4" />
                    </button>
                    <button onClick={() => toast('Reconciliation data exported', 'success')} className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <Download className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* ── Reconciliation Table ── */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            <tr>
                                <th className="pl-6 py-4 w-20"></th>
                                <th className="px-4 py-4" colSpan="2">Bank Feed (Imported)</th>
                                <th className="px-4 py-4 text-center">Status</th>
                                <th className="px-4 py-4" colSpan="2">Internal Ledger (Suggested/Match)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx, i) => (
                                <ReconcileRow key={i} {...tx} onAction={(label, name) => toast(`${label}: ${name}`, 'success')} />
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
                    <span>Showing 5 of 14 unreconciled transactions</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50" disabled>Previous</button>
                        <button onClick={() => toast('Loading next page...', 'info')} className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800">Next</button>
                    </div>
                </div>
            </div>

            {/* ── Feature Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <FeatureCard
                    icon={Cpu}
                    title="Smart Matching"
                    description="Our AI suggests matches based on previous history, vendor names, and exact amounts to save you time."
                />
                <FeatureCard
                    icon={Lock}
                    title="Secure Connection"
                    description="Bank feeds are encrypted with bank-level security. We never store your login credentials."
                />
                <FeatureCard
                    icon={FileCheck}
                    title="Journal Audit"
                    description="Every reconciliation creates a verifiable audit trail for tax season and investor reviews."
                />
            </div>

            {/* ── Footer ── */}
            <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800">
                © 2025 Nano Books Accounting SaaS. All rights reserved. · <a href="#" className="text-primary hover:underline">Privacy Policy</a> · <a href="#" className="text-primary hover:underline">Support Center</a>
            </div>
        </div>
    );
}
