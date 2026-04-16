import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    Plus,
    Loader2,
    ChevronLeft
} from 'lucide-react';

const tabs = ['Personal Info', 'Payroll History', 'Tax Documents', 'Bank Details'];

const toMoney = (value) => `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const mapPayrollRow = (row) => {
    const period = row.period || row.name || (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'Period');
    const grossNum = Number(row.gross || row.grossPay || row.total || row.totalAmount || row.amount || 0);
    const deductionsNum = Number(row.deductions || row.totalDeductions || 0);
    const netNum = Number(row.net || row.netPay || grossNum - deductionsNum);

    return {
        id: row.id || `${period}-${grossNum}`,
        period,
        gross: toMoney(grossNum),
        deductions: toMoney(deductionsNum),
        net: toMoney(netNum),
        status: row.status || 'Processed'
    };
};

const PayrollRow = ({ row, onView }) => {
    const statusStyle = {
        Processed: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600',
        Paid: 'bg-blue-50 dark:bg-blue-500/10 text-blue-600',
        Pending: 'bg-amber-50 dark:bg-amber-500/10 text-amber-600'
    }[row.status] || 'bg-slate-100 text-slate-500';

    return (
        <tr className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
            <td className="px-6 py-4"><span className="text-sm font-medium text-slate-800 dark:text-slate-200">{row.period}</span></td>
            <td className="px-6 py-4 text-sm text-slate-800 dark:text-slate-200">{row.gross}</td>
            <td className="px-6 py-4 text-sm font-medium text-rose-500">{row.deductions}</td>
            <td className="px-6 py-4 text-sm font-bold text-slate-800 dark:text-slate-200">{row.net}</td>
            <td className="px-6 py-4 text-center"><span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${statusStyle}`}>{row.status}</span></td>
            <td className="px-6 py-4 text-center"><button onClick={() => onView(row)} className="text-slate-400 hover:text-primary transition-colors"><Eye className="w-4 h-4" /></button></td>
        </tr>
    );
};

export default function EmployeeProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const [activeTab, setActiveTab] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [employee, setEmployee] = useState(null);
    const [financialSnapshot, setFinancialSnapshot] = useState(null);
    const [payrollHistory, setPayrollHistory] = useState([]);

    const pageSize = 8;

    const fetchEmployeeData = async () => {
        if (!id) return;
        setLoading(true);
        try {
            const [empRes, financeRes, payrollRes] = await Promise.all([
                api.employees.getOne(id).catch(() => null),
                api.employees.getFinancialSnapshot(id, new Date().getFullYear()).catch(() => ({})),
                api.employees.getPayrollHistory(id).catch(() => [])
            ]);

            const emp = empRes?.data || empRes;
            if (!emp) {
                toast('Employee not found', 'error');
                navigate('/employees');
                return;
            }

            const finance = financeRes?.data || financeRes || {};
            const payrollRaw = payrollRes?.data || payrollRes || [];

            setEmployee(emp);
            setFinancialSnapshot({
                grossYTD: finance.grossYTD || finance.gross_ytd || toMoney(finance.gross || 0),
                taxesYTD: finance.taxesYTD || finance.taxes_ytd || toMoney(finance.taxes || 0),
                benefits: finance.benefits || toMoney(finance.benefitsAmount || 0),
                netTakeHome: finance.netTakeHome || finance.net_take_home || toMoney(finance.net || 0)
            });
            setPayrollHistory(Array.isArray(payrollRaw) ? payrollRaw.map(mapPayrollRow) : []);
        } catch (error) {
            toast(error.message || 'Failed to load employee data', 'error');
            navigate('/employees');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployeeData();
    }, [id]);

    const filteredPayroll = useMemo(() => {
        return payrollHistory.filter((row) => {
            const matchesSearch = !searchTerm || row.period.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || row.status.toLowerCase() === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [payrollHistory, searchTerm, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filteredPayroll.length / pageSize));
    const pagedPayroll = filteredPayroll.slice((page - 1) * pageSize, page * pageSize);

    useEffect(() => {
        setPage(1);
    }, [searchTerm, statusFilter]);

    const handleEditProfile = async () => {
        if (!employee) return;

        const role = window.prompt('Role', employee.role || '');
        if (!role) return;
        const location = window.prompt('Location', employee.location || '') || employee.location;
        const salaryInput = window.prompt('Annual Salary', String(employee.salary || 0));

        try {
            await api.employees.update(id, {
                role,
                location,
                salary: Number(salaryInput || 0)
            });
            toast('Employee profile updated', 'success');
            fetchEmployeeData();
        } catch (error) {
            toast(error.message || 'Failed to update employee', 'error');
        }
    };

    const handleNewPayRun = async () => {
        try {
            await api.payroll.calculate({ employeeId: id });
            await api.payroll.submit({ employeeId: id });
            toast('New pay run started', 'success');
            fetchEmployeeData();
        } catch (error) {
            toast(error.message || 'Failed to start pay run', 'error');
        }
    };

    const handleTaxBreakdown = async () => {
        try {
            const res = await api.employees.getFinancialSnapshot(id, new Date().getFullYear());
            const data = res?.data || res || {};
            setFinancialSnapshot({
                grossYTD: data.grossYTD || data.gross_ytd || toMoney(data.gross || 0),
                taxesYTD: data.taxesYTD || data.taxes_ytd || toMoney(data.taxes || 0),
                benefits: data.benefits || toMoney(data.benefitsAmount || 0),
                netTakeHome: data.netTakeHome || data.net_take_home || toMoney(data.net || 0)
            });
            toast('Detailed tax breakdown refreshed', 'success');
        } catch (error) {
            toast(error.message || 'Failed to load tax breakdown', 'error');
        }
    };

    if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    if (!employee) return null;

    return (
        <div className="flex flex-col gap-6 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                        <button onClick={() => navigate('/employees')} className="hover:text-primary transition-colors flex items-center gap-1"><ChevronLeft className="w-4 h-4" /> Employees</button>
                        <span>›</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{employee.name}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Employee Profile</h1>
                </div>
                <button onClick={handleNewPayRun} className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm shadow-primary/20 transition-all">
                    <Plus className="w-4 h-4" /> New Pay Run
                </button>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl border-4 border-slate-100 dark:border-slate-800 shrink-0 capitalize">
                        {employee.avatar ? <img src={employee.avatar} alt={employee.name} className="w-full h-full rounded-full object-cover" /> : (employee.name || 'U').charAt(0)}
                    </div>
                    <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-3 mb-1">
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">{employee.name}</h2>
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[10px] font-bold uppercase">Active</span>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{employee.role || 'No Role Assigned'} • {employee.department || employee.dept || 'General'}</p>
                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                            <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {employee.email || '-'}</span>
                            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {employee.location || '-'}</span>
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Current Annual Salary</p>
                        <p className="text-3xl font-bold text-slate-800 dark:text-white">{typeof employee.salary === 'number' ? `$${employee.salary.toLocaleString()}` : employee.salary || '$0.00'}</p>
                        <button onClick={handleEditProfile} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 mt-2 ml-auto"><Pencil className="w-3 h-3" /> Edit Profile</button>
                    </div>
                </div>
            </div>

            <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
                {tabs.map((tab, i) => (
                    <button key={i} onClick={() => setActiveTab(i)} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === i ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white">Year-to-Date Earnings</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Cumulative salary and taxes for fiscal year {new Date().getFullYear()}</p>
                        </div>
                    </div>
                    <div className="h-40 flex items-center justify-center text-slate-400 text-sm">Payroll trend preview</div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
                    <h3 className="font-bold text-slate-800 dark:text-white mb-1">Financial Snapshot</h3>
                    <p className="text-xs text-slate-400 mb-6">Summary for {new Date().getFullYear()}</p>
                    <div className="space-y-5">
                        <div className="flex justify-between items-center"><span className="text-sm text-slate-600 dark:text-slate-400">Gross YTD</span><span className="text-sm font-bold text-slate-800 dark:text-white">{financialSnapshot?.grossYTD || '$0.00'}</span></div>
                        <div className="flex justify-between items-center"><span className="text-sm text-slate-600 dark:text-slate-400">Taxes YTD</span><span className="text-sm font-bold text-rose-500">{financialSnapshot?.taxesYTD || '$0.00'}</span></div>
                        <div className="flex justify-between items-center"><span className="text-sm text-slate-600 dark:text-slate-400">Benefits/Other</span><span className="text-sm font-bold text-rose-500">{financialSnapshot?.benefits || '$0.00'}</span></div>
                        <div className="border-t border-slate-200 dark:border-slate-700 pt-4"><div className="flex justify-between items-center"><span className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-primary" />Net Take-Home</span><span className="text-lg font-bold text-slate-800 dark:text-white">{financialSnapshot?.netTakeHome || '$0.00'}</span></div></div>
                    </div>
                    <button onClick={handleTaxBreakdown} className="w-full mt-6 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">View Detailed Tax Breakdown</button>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <h3 className="font-bold text-slate-800 dark:text-white">Payroll History</h3>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-48">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search periods..." className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary" />
                        </div>
                        <button onClick={() => setStatusFilter((s) => s === 'all' ? 'processed' : s === 'processed' ? 'paid' : s === 'paid' ? 'pending' : 'all')} className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap"><Filter className="w-4 h-4" /> Filter: {statusFilter}</button>
                    </div>
                </div>

                <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                    {pagedPayroll.length > 0 ? pagedPayroll.map((row) => (
                        <div key={row.id} className="p-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{row.period}</p>
                                <span className="text-xs font-bold uppercase px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{row.status}</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <div><p className="text-slate-400">Gross</p><p className="font-semibold text-slate-700 dark:text-slate-200">{row.gross}</p></div>
                                <div><p className="text-slate-400">Deductions</p><p className="font-semibold text-rose-500">{row.deductions}</p></div>
                                <div><p className="text-slate-400">Net</p><p className="font-bold text-slate-800 dark:text-white">{row.net}</p></div>
                            </div>
                            <button onClick={() => toast(`${row.period}: Net ${row.net}`, 'info')} className="w-full py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">View Details</button>
                        </div>
                    )) : (
                        <div className="px-6 py-12 text-center text-slate-500 italic">No payroll history found for this employee.</div>
                    )}
                </div>

                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left min-w-[760px]">
                        <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            <tr><th className="px-6 py-4">Pay Period</th><th className="px-6 py-4">Gross Pay</th><th className="px-6 py-4">Total Deductions</th><th className="px-6 py-4">Net Pay</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-center">Actions</th></tr>
                        </thead>
                        <tbody>
                            {pagedPayroll.length > 0 ? pagedPayroll.map((row) => (
                                <PayrollRow key={row.id} row={row} onView={(r) => toast(`${r.period}: Net ${r.net}`, 'info')} />
                            )) : (
                                <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-500 italic">No payroll history found for this employee.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-sm text-slate-500">
                    <span>Showing {(page - 1) * pageSize + (pagedPayroll.length ? 1 : 0)}-{(page - 1) * pageSize + pagedPayroll.length} of {filteredPayroll.length} pay periods</span>
                    <div className="flex gap-2">
                        <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">Previous</button>
                        <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-3 py-1 border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50">Next</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

