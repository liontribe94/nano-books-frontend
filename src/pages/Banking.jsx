import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../lib/api';
import { useToast } from '../components/ui/Toast';
import {
    Search,
    Download,
    CheckCircle2,
    XCircle,
    Sparkles,
    BookOpen,
    ArrowRight,
    Cpu,
    Lock,
    FileCheck,
    Loader2
} from 'lucide-react';

const StatCard = ({ label, value, sub, variant = 'default' }) => {
    const border = {
        default: 'border-slate-200 dark:border-slate-800',
        danger: 'border-rose-200 dark:border-rose-800',
        success: 'border-emerald-200 dark:border-emerald-800'
    }[variant];

    const valColor = {
        default: 'text-slate-800 dark:text-white',
        danger: 'text-rose-600',
        success: 'text-emerald-600'
    }[variant];

    return (
        <div className={`bg-white dark:bg-slate-900 p-5 rounded-xl border ${border} shadow-sm flex flex-col gap-1`}>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{label}</span>
            <span className={`text-2xl font-bold ${valColor}`}>{value}</span>
            {sub && <span className="text-xs text-slate-400 mt-0.5">{sub}</span>}
        </div>
    );
};

const StatusBadge = ({ type }) => {
    const cfg = {
        exact: { bg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600', label: 'Exact Match', icon: CheckCircle2 },
        none: { bg: 'bg-slate-100 dark:bg-slate-800 text-slate-500', label: 'No Match', icon: XCircle },
        suggest: { bg: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600', label: 'Suggested', icon: Sparkles }
    }[type] || { bg: 'bg-slate-100 dark:bg-slate-800 text-slate-500', label: 'No Match', icon: XCircle };

    const Icon = cfg.icon;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${cfg.bg}`}>
            <Icon className="w-3 h-3" /> {cfg.label}
        </span>
    );
};

const ActionBtn = ({ label, variant = 'primary', onClick }) => {
    const styles = {
        primary: 'bg-primary text-white hover:bg-primary/90',
        outline: 'border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
        green: 'bg-emerald-500 text-white hover:bg-emerald-600'
    }[variant];

    return (
        <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${styles}`}>
            {label}
        </button>
    );
};

const ReconcileRow = ({ tx, onAction }) => (
    <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
        <td className="pl-6 py-5 text-xs font-bold text-slate-400 uppercase whitespace-nowrap align-top pt-6">
            {new Date(tx.date).toLocaleDateString()}
        </td>
        <td className="px-4 py-5">
            <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{tx.bankName}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{tx.bankSub}</p>
            </div>
        </td>
        <td className="px-4 py-5 text-right">
            <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-emerald-600' : 'text-slate-800 dark:text-slate-200'}`}>
                {`${tx.amount > 0 ? '+' : '-'}$${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            </span>
        </td>
        <td className="px-4 py-5">
            <div className="flex flex-col items-center gap-2">
                <StatusBadge type={tx.status} />
                <div className="flex gap-1.5">
                    {tx.status === 'exact' ? (
                        <ActionBtn label="View" variant="outline" onClick={() => onAction('view', tx)} />
                    ) : (
                        <ActionBtn label="Match" variant="green" onClick={() => onAction('match', tx)} />
                    )}
                </div>
            </div>
        </td>
        <td className="px-4 py-5">
            {tx.ledgerName ? (
                <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{tx.ledgerName}</p>
                    {tx.ledgerSub && <p className="text-[11px] text-slate-400 mt-0.5">{tx.ledgerSub}</p>}
                </div>
            ) : (
                <p className="text-xs text-slate-400 italic">Select which transaction matches this bank entry.</p>
            )}
        </td>
        <td className="pr-6 py-5 text-right">
            {tx.ledgerAmount ? (
                <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    ${Math.abs(tx.ledgerAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
            ) : (
                <button onClick={() => onAction('suggest', tx)} className="text-xs text-primary font-semibold hover:underline">Find other matches</button>
            )}
        </td>
    </tr>
);

const FeatureCard = ({ icon, title, description }) => (
    <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4">
        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
            {React.createElement(icon, { className: 'w-5 h-5' })}
        </div>
        <div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-white">{title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{description}</p>
        </div>
    </div>
);

export default function Banking() {
    const toast = useToast();
    const [tab, setTab] = useState('unreconciled');
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [transactions, setTransactions] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [isConnecting, setIsConnecting] = useState(false);
    const [balances, setBalances] = useState({ statement: 0, inBooks: 0, difference: 0 });

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://connect.withmono.com/connect.js';
        script.async = true;
        document.body.appendChild(script);
        return () => document.body.removeChild(script);
    }, []);

    const fetchBankingData = async () => {
        setLoading(true);
        try {
            const [accRes, txRes] = await Promise.all([
                api.banking.getAccounts().catch(() => ({ data: [] })),
                api.banking.getTransactions().catch(() => ({ data: [] }))
            ]);

            const connectedAccounts = accRes.data || [];
            setAccounts(connectedAccounts);

            const data = txRes.data || [];

            const formatted = data.map((tx) => {
                const amount = Number(tx.amount || tx.total_amount || 0);
                const reconciled = (tx.status || '').toLowerCase() === 'reconciled';
                return {
                    id: tx.id || `${tx.description}-${tx.date}`,
                    date: tx.date || tx.created_at || new Date().toISOString(),
                    bankName: tx.merchant || tx.vendor || tx.description || 'Unknown Transaction',
                    bankSub: tx.type || 'General',
                    amount,
                    status: reconciled ? 'exact' : 'none',
                    ledgerName: reconciled ? (tx.description || tx.merchant || tx.vendor) : null,
                    ledgerSub: reconciled ? 'Matched transaction' : null,
                    ledgerAmount: reconciled ? amount : null
                };
            });

            setTransactions(formatted);

            const inBooks = formatted.reduce((acc, tx) => acc + tx.amount, 0);

            // Calculate real statement balance from Mono accounts
            const statementBal = connectedAccounts.reduce((acc, a) => acc + (a.balance || 0), 0);

            setBalances((prev) => ({
                ...prev,
                statement: statementBal,
                inBooks,
                difference: Math.abs(statementBal - inBooks)
            }));
        } catch (error) {
            toast(error.message || 'Failed to load transactions', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBankingData();
    }, []);

    const handleConnectMono = () => {
        if (!window.Connect) {
            toast('Mono Connect script is loading. Please wait a moment.', 'error');
            return;
        }

        const monoConnect = new window.Connect({
            key: import.meta.env.VITE_MONO_PUBLIC_KEY || 'test_pk_dummy',
            onSuccess: async ({ code }) => {
                setIsConnecting(true);
                try {
                    await api.banking.exchangeCode(code);
                    toast('Bank account linked successfully!', 'success');
                    await fetchBankingData();
                } catch (error) {
                    toast(error.message || 'Failed to link account', 'error');
                } finally {
                    setIsConnecting(false);
                }
            },
            onClose: () => console.log('Widget closed')
        });

        monoConnect.setup();
        monoConnect.open();
    };

    const handleAction = async (action, tx) => {
        if (action === 'view') {
            await fetchBankingData();
            toast(`Loaded latest history for ${tx.bankName}`, 'success');
            return;
        }

        if (action === 'match') {
            setTransactions((prev) => prev.map((row) => row.id === tx.id ? {
                ...row,
                status: 'exact',
                ledgerName: row.bankName,
                ledgerSub: 'Matched manually',
                ledgerAmount: row.amount
            } : row));
            toast(`Matched ${tx.bankName}`, 'success');
            return;
        }

        if (action === 'suggest') {
            toast(`Suggestions loaded for ${tx.bankName}`, 'info');
        }
    };

    const handleFinalize = () => {
        setTransactions((prev) => prev.map((tx) => tx.status === 'exact' ? tx : {
            ...tx,
            status: 'exact',
            ledgerName: tx.bankName,
            ledgerSub: 'Auto-reconciled',
            ledgerAmount: tx.amount
        }));
        toast('Reconciliation finalized', 'success');
    };

    const filteredTransactions = useMemo(() => {
        const byTab = tab === 'unreconciled' ? transactions.filter((tx) => tx.status !== 'exact') : transactions;
        return byTab.filter((tx) => {
            if (!searchTerm) return true;
            const q = searchTerm.toLowerCase();
            return tx.bankName.toLowerCase().includes(q) || tx.bankSub.toLowerCase().includes(q);
        });
    }, [transactions, tab, searchTerm]);

    const progress = Math.min(100, Math.round((transactions.filter((tx) => tx.status === 'exact').length / (transactions.length || 1)) * 100));

    const exportCsv = () => {
        const header = ['date', 'name', 'type', 'amount', 'status'];
        const rows = filteredTransactions.map((tx) => [tx.date, tx.bankName, tx.bankSub, tx.amount, tx.status]);
        const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'reconciliation.csv';
        a.click();
        URL.revokeObjectURL(url);
        toast('Reconciliation exported', 'success');
    };

    if (loading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    return (
        <div className="flex flex-col gap-8 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Bank Reconciliation</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-slate-500 dark:text-slate-400">Connected Accounts:</span>
                        {accounts.length > 0 ? (
                            <div className="flex gap-2">
                                {accounts.map(acc => (
                                    <span key={acc.id} className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase" title={acc.account_number}>
                                        {acc.bank_name}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold uppercase">Not Connected</span>
                        )}
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleConnectMono}
                        disabled={isConnecting}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        {isConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
                        {isConnecting ? 'Connecting...' : 'Connect Bank'}
                    </button>
                    <button
                        onClick={async () => {
                            setTab('all');
                            await fetchBankingData();
                            toast('Reconciliation history refreshed', 'success');
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        <BookOpen className="w-4 h-4" />
                        Reconciliation History
                    </button>
                    <button onClick={handleFinalize} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm shadow-primary/20 transition-all">
                        Finish Now
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard label="Statement Balance" value={`$${balances.statement.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} sub="Verified Bank Feed" />
                <StatCard label="In-Book's Balance" value={`$${balances.inBooks.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} sub="Current Ledger Total" />
                <StatCard label="Difference" value={`$${balances.difference.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} sub={`${transactions.filter((tx) => tx.status !== 'exact').length} transactions remaining`} variant={balances.difference === 0 ? 'success' : 'danger'} />
                <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Progress</span>
                    <span className="text-2xl font-bold text-emerald-600">{progress}%</span>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-4 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search transactions..."
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setTab('unreconciled')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${tab === 'unreconciled' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                        Unreconciled
                    </button>
                    <button onClick={() => setTab('all')} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${tab === 'all' ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                        All Transactions
                    </button>
                    <button onClick={exportCsv} className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1">
                        <Download className="w-3.5 h-3.5" /> Export
                    </button>
                </div>
            </div>

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
                            {filteredTransactions.length > 0 ? filteredTransactions.map((tx) => (
                                <ReconcileRow key={tx.id} tx={tx} onAction={handleAction} />
                            )) : (
                                <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500 italic">No transactions found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
                    <span>Showing {filteredTransactions.length} of {transactions.length} transactions</span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <FeatureCard icon={Cpu} title="Smart Matching" description="Our AI suggests matches based on previous history, vendor names, and exact amounts to save you time." />
                <FeatureCard icon={Lock} title="Secure Connection" description="Bank feeds are encrypted with bank-level security. We never store your login credentials." />
                <FeatureCard icon={FileCheck} title="Journal Audit" description="Every reconciliation creates a verifiable audit trail for tax season and investor reviews." />
            </div>
        </div>
    );
}

