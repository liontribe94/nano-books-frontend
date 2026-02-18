import React, { useState, useEffect } from 'react';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api';
import {
    Mail,
    MapPin,
    Pencil,
    DollarSign,
    Search,
    Filter,
    Eye,
    TrendingUp,
    Plus,
    Loader2
} from 'lucide-react';

/* ─── Tabs ─── */
const tabs = ['Personal Info', 'Payroll History', 'Tax Documents', 'Bank Details'];

/* ─── Payroll Row ─── */
const PayrollRow = ({ period, gross, deductions, net, status, onView }) => {
    const statusStyle = {
        Processed: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600',
        Paid: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600',
        Pending: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600',
    }[status] || 'bg-slate-100 text-slate-500';

    return (
        <tr className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
            <td className="px-6 py-4">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{period}</span>
            </td>
            <td className="px-6 py-4 text-sm text-slate-800 dark:text-slate-200">{gross}</td>
            <td className="px-6 py-4 text-sm font-medium text-rose-500">{deductions}</td>
            <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200">{net}</td>
            <td className="px-6 py-4 text-center">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusStyle}`}>
                    {status}
                </span>
            </td>
            <td className="px-6 py-4 text-center">
                <button onClick={() => onView(period)} className="text-slate-400 hover:text-primary transition-colors">
                    <Eye className="w-4 h-4" />
                </button>
            </td>
        </tr>
    );
};

export default function Employees() {
    const toast = useToast();
    const [activeTab, setActiveTab] = useState(1); // Payroll History active
    const [loading, setLoading] = useState(true);
    const [employee, setEmployee] = useState(null);
    const [financialSnapshot, setFinancialSnapshot] = useState(null);
    const [payrollHistory, setPayrollHistory] = useState([]);

    useEffect(() => {
        const fetchEmployeeData = async () => {
            setLoading(true);
            try {
                const employeeId = 'emp_123'; // Demo ID
                const [empData, financeData, payrollData] = await Promise.all([
                    api.employees.getOne(employeeId).catch(() => ({
                        name: 'Marcus Richardson',
                        role: 'Senior Software Engineer',
                        dept: 'Engineering Department',
                        email: 'm.richardson@cloudacc.com',
                        location: 'Denver, CO',
                        salary: '$142,500.00',
                        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
                    })),
                    api.employees.getFinancialSnapshot(employeeId, 2024).catch(() => ({
                        grossYTD: '$109,675.00',
                        taxesYTD: '-$24,581.20',
                        benefits: '-$9,412.50',
                        netTakeHome: '$75,881.30',
                    })),
                    api.employees.getPayrollHistory(employeeId).catch(() => [
                        { period: 'Sep 16 – Sep 30, 2024', gross: '$5,937.50', deductions: '$1,721.88', net: '$4,215.62', status: 'Processed' },
                        { period: 'Sep 01 – Sep 15, 2024', gross: '$5,937.50', deductions: '$1,721.88', net: '$4,215.62', status: 'Paid' },
                        { period: 'Aug 16 – Aug 31, 2024', gross: '$5,937.50', deductions: '$1,721.88', net: '$4,215.62', status: 'Paid' },
                    ])
                ]);

                setEmployee(empData);
                setFinancialSnapshot(financeData);
                setPayrollHistory(payrollData);

            } catch (error) {
                console.error("Employee fetch error", error);
                toast('Failed to load employee data', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchEmployeeData();
    }, []);

    const chartPoints = [20, 28, 35, 38, 42, 50, 58, 62, 72, 80, 90, 100];

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 pb-12">
            {/* ── Breadcrumb + Header ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                        <span>Employees</span>
                        <span>›</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{employee.name}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Employee Profile and Salary History</h1>
                </div>
                <button onClick={() => toast('New pay run started!', 'success')} className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm shadow-primary/20 transition-all">
                    <Plus className="w-4 h-4" />
                    New Pay Run
                </button>
            </div>

            {/* ── Profile Card ── */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <img
                        src={employee.avatar}
                        alt={employee.name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800"
                    />
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{employee.name}</h2>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase">Active</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{employee.role} • {employee.dept}</p>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {employee.email}</span>
                            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {employee.location}</span>
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Current Annual Salary</p>
                        <p className="text-3xl font-bold text-slate-800 dark:text-white">{employee.salary}</p>
                        <button onClick={() => toast('Edit profile coming soon', 'info')} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mt-2 ml-auto">
                            <Pencil className="w-3 h-3" /> Edit Profile
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800">
                {tabs.map((tab, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveTab(i)}
                        className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${activeTab === i
                            ? 'border-primary text-primary'
                            : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* ── Year-to-Date Earnings + Financial Snapshot ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white">Year-to-Date Earnings</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Cumulative salary and taxes for fiscal year 2024</p>
                        </div>
                        <div className="flex gap-4 text-xs">
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-primary"></span> Gross Earnings</span>
                            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-300"></span> Taxes Paid</span>
                        </div>
                    </div>

                    {/* Simple SVG line chart */}
                    <div className="relative h-48">
                        <svg viewBox="0 0 400 160" className="w-full h-full" preserveAspectRatio="none">
                            {/* Grid lines */}
                            {[0, 40, 80, 120, 160].map((y) => (
                                <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeWidth="0.5" />
                            ))}
                            {/* Gross earnings line */}
                            <polyline
                                fill="none"
                                stroke="#1173d4"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                points={chartPoints.map((p, i) => `${(i / 11) * 390 + 5},${160 - p * 1.5}`).join(' ')}
                            />
                            {/* Area fill */}
                            <polygon
                                fill="url(#gradient)"
                                opacity="0.15"
                                points={`5,160 ${chartPoints.map((p, i) => `${(i / 11) * 390 + 5},${160 - p * 1.5}`).join(' ')} 395,160`}
                            />
                            {/* Taxes line */}
                            <polyline
                                fill="none"
                                stroke="#cbd5e1"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeDasharray="4 4"
                                points={chartPoints.map((p, i) => `${(i / 11) * 390 + 5},${160 - p * 0.5}`).join(' ')}
                            />
                            <defs>
                                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#1173d4" />
                                    <stop offset="100%" stopColor="#1173d4" stopOpacity="0" />
                                </linearGradient>
                            </defs>
                        </svg>
                        <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-medium px-1">
                            {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                                <span key={m}>{m}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Financial Snapshot */}
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-1">Financial Snapshot</h3>
                    <p className="text-xs text-slate-400 mb-6">Summary for 2024</p>

                    <div className="space-y-5">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Gross YTD</span>
                            <span className="text-sm font-bold text-slate-800 dark:text-white">{financialSnapshot.grossYTD}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Taxes YTD</span>
                            <span className="text-sm font-bold text-rose-500">{financialSnapshot.taxesYTD}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Benefits/Other</span>
                            <span className="text-sm font-bold text-rose-500">{financialSnapshot.benefits}</span>
                        </div>

                        <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                                    <DollarSign className="w-4 h-4 text-primary" />
                                    Net Take-Home
                                </span>
                                <span className="text-lg font-bold text-slate-800 dark:text-white">{financialSnapshot.netTakeHome}</span>
                            </div>
                        </div>
                    </div>

                    <button onClick={() => toast('Detailed tax breakdown coming soon', 'info')} className="w-full mt-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        View Detailed Tax Breakdown
                    </button>
                </div>
            </div>

            {/* ── Payroll History Table ── */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <h3 className="font-bold text-slate-800 dark:text-white">Payroll History</h3>
                    <div className="flex items-center gap-3">
                        <div className="relative w-48">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search periods..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <button onClick={() => toast('Filter options coming soon', 'info')} className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <Filter className="w-4 h-4" />
                            Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Pay Period</th>
                                <th className="px-6 py-4">Gross Pay</th>
                                <th className="px-6 py-4">Total Deductions</th>
                                <th className="px-6 py-4">Net Pay</th>
                                <th className="px-6 py-4 text-center">Status</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payrollHistory.map((row, i) => (
                                <PayrollRow key={i} {...row} onView={(period) => toast(`Viewing details for ${period}`, 'info')} />
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
                    <span>Showing 3 of 18 pay periods</span>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50" disabled>Previous</button>
                        <button onClick={() => toast('Loading next page...', 'info')} className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
