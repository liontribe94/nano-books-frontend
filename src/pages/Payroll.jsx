import React, { useState, useEffect } from 'react';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api';
import {
    Search,
    Filter,
    Download,
    Save,
    Printer,
    ArrowRight,
    AlertTriangle,
    Eye,
    CheckCircle2,
    Loader2
} from 'lucide-react';

/* ─── Stepper ─── */
const steps = ['Review Hours', 'Calculate Taxes', 'Approve & Pay'];

const Stepper = ({ current }) => (
    <div className="flex items-center gap-0 w-full max-w-lg mx-auto">
        {steps.map((s, i) => (
            <React.Fragment key={i}>
                <div className="flex flex-col items-center gap-1.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${i < current ? 'bg-primary text-white' :
                        i === current ? 'bg-amber-400 text-white' :
                            'bg-slate-200 dark:bg-slate-700 text-slate-500'
                        }`}>
                        {i < current ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-[11px] font-medium whitespace-nowrap ${i <= current ? 'text-slate-800 dark:text-white' : 'text-slate-400'
                        }`}>
                        {s}
                    </span>
                </div>
                {i < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 mb-5 ${i < current ? 'bg-primary' : 'bg-slate-200 dark:bg-slate-700'
                        }`} />
                )}
            </React.Fragment>
        ))}
    </div>
);

/* ─── Stat Card ─── */
const StatCard = ({ label, value, sub, variant = 'default' }) => {
    const border = {
        default: 'border-slate-200 dark:border-slate-800',
        warning: 'border-amber-200 dark:border-amber-800',
    }[variant];

    const bg = {
        default: 'bg-white dark:bg-slate-900',
        warning: 'bg-amber-50/50 dark:bg-amber-900/10',
    }[variant];

    return (
        <div className={`${bg} p-5 rounded-xl border ${border} shadow-sm`}>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{label}</span>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-1">{value}</h3>
            {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
        </div>
    );
};

/* ─── Employee Row ─── */
const EmployeeRow = ({ initials, name, role, regHours, overtime, expenses, grossPay, highlight, onView }) => (
    <tr className={`border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors ${highlight ? 'bg-amber-50/30 dark:bg-amber-900/5' : ''}`}>
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${highlight
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15'
                    : 'bg-primary/10 text-primary'
                    }`}>
                    {initials}
                </div>
                <div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{name}</p>
                    <p className="text-[11px] text-slate-400">{role}</p>
                </div>
            </div>
        </td>
        <td className="px-6 py-4 text-center">
            <span className="text-sm text-slate-800 dark:text-slate-200">{regHours}</span>
        </td>
        <td className="px-6 py-4 text-center">
            <span className={`text-sm font-medium ${overtime > 0 ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded' : 'text-slate-800 dark:text-slate-200'}`}>
                {overtime}
            </span>
        </td>
        <td className="px-6 py-4 text-center text-sm text-slate-800 dark:text-slate-200">{expenses}</td>
        <td className="px-6 py-4 text-right text-sm font-bold text-slate-800 dark:text-slate-200">{grossPay}</td>
        <td className="px-6 py-4 text-center">
            <button onClick={() => onView(name)} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 justify-center mx-auto">
                <Eye className="w-3.5 h-3.5" />
                View Breakdown
            </button>
        </td>
    </tr>
);


export default function Payroll() {
    const toast = useToast();
    const [currentStep] = useState(0);
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [payrollStats, setPayrollStats] = useState({
        totalCost: 0,
        netPay: 0,
        taxLiabilities: 0
    });
    const [cycle, setCycle] = useState('October 2023');

    useEffect(() => {
        const fetchPayrollData = async () => {
            setLoading(true);
            try {
                const [cycleData, stats, empList] = await Promise.all([
                    api.payroll.getCurrentCycle().catch(() => ({ period: 'October 2023' })),
                    api.payroll.getStats().catch(() => ({
                        totalCost: 42850.00,
                        netPay: 31420.50,
                        taxLiabilities: 11429.50
                    })),
                    api.employees.getAll({ limit: 50 }).catch(() => [])
                ]);

                setCycle(cycleData.period);
                setPayrollStats(stats);

                // Map employees to payroll row format
                // If API returns payroll-specific fields, use them. Otherwise mock for demo.
                const mappedEmployees = Array.isArray(empList) && empList.length > 0 ? empList.map(e => ({
                    initials: e.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase(),
                    name: e.name,
                    role: e.role,
                    regHours: 160, // Mocked for now as this would come from time-tracking integration
                    overtime: 0,
                    expenses: 0,
                    grossPay: e.salary ? `$${(parseInt(e.salary.replace(/[^0-9]/g, '')) / 12).toLocaleString()}` : '$5,000.00',
                    highlight: false
                })) : [
                    { initials: 'JD', name: 'Jane Doe', role: 'Product Designer', regHours: 160, overtime: 5, expenses: 0, grossPay: '$6,950.00', highlight: false },
                    { initials: 'MS', name: 'Michael Smith', role: 'Sr. Backend Engineer', regHours: 160, overtime: 0, expenses: 190, grossPay: '$8,000.00', highlight: false },
                    { initials: 'SR', name: 'Sarah Rodriguez', role: 'Marketing Lead', regHours: 152, overtime: 0, expenses: 0, grossPay: '$5,700.00', highlight: true },
                    { initials: 'TB', name: 'Tom Baker', role: 'DevOps Engineer', regHours: 160, overtime: 12, expenses: 150, grossPay: '$4,250.00', highlight: false },
                ];
                setEmployees(mappedEmployees);

            } catch (error) {
                console.error("Payroll fetch error", error);
                toast('Failed to load payroll data', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchPayrollData();
    }, []);

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
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Payroll Processing</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Monthly Cycle: {cycle}</p>
                </div>
                <span className="px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 text-xs font-bold uppercase border border-amber-200 dark:border-amber-500/20">
                    Draft In Progress
                </span>
            </div>

            {/* ── Stepper ── */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <Stepper current={currentStep} />
            </div>

            {/* ── Stat Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <StatCard label="Total Cost" value={`$${payrollStats.totalCost.toLocaleString()}`} sub="↑ 2.3% from last month" />
                <StatCard label="Net Pay" value={`$${payrollStats.netPay.toLocaleString()}`} sub="After all deductions" />
                <StatCard label="Tax Liabilities" value={`$${payrollStats.taxLiabilities.toLocaleString()}`} sub="Federal & State deductions" variant="warning" />
            </div>

            {/* ── Employee Table ── */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                {/* Filter Bar */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => toast('Filter options coming soon', 'info')} className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <Filter className="w-4 h-4" /> Filter
                        </button>
                        <button onClick={() => toast('Payroll data exported to CSV', 'success')} className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <Download className="w-4 h-4" /> Export
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Employee</th>
                                <th className="px-6 py-4 text-center">Reg Hours</th>
                                <th className="px-6 py-4 text-center">Overtime</th>
                                <th className="px-6 py-4 text-center">Expenses</th>
                                <th className="px-6 py-4 text-right">Gross Pay</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp, i) => (
                                <EmployeeRow key={i} {...emp} onView={(name) => toast(`Viewing breakdown for ${name}`, 'info')} />
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Warning */}
                <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-amber-50/50 dark:bg-amber-900/5 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                        <span className="font-semibold">Sarah Rodriguez</span> has 8 hours of unpaid leave detected for this period.
                    </p>
                </div>
            </div>

            {/* ── Footer Actions ── */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <button onClick={() => toast('Payroll draft saved', 'success')} className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Save className="w-4 h-4" /> Save Draft
                    </button>
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Printer className="w-4 h-4" /> Print Review
                    </button>
                </div>
                <div className="flex items-center gap-5">
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Calculated Net</p>
                        <p className="text-xl font-bold text-slate-800 dark:text-white">${payrollStats.netPay.toLocaleString()}</p>
                    </div>
                    <button onClick={() => toast('Payroll submitted for approval!', 'success')} className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-md shadow-primary/20 transition-all">
                        Submit Payroll
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
