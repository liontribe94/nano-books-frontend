import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api';
import { Loader2, Plus, Settings, FileText, Calendar, DollarSign, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CurrencySelect from '../components/ui/CurrencySelect';


export default function PayrollDashboard() {
  const navigate = useNavigate();
  const toast = useToast();
  const { formatCurrency: currency } = useAuth();

  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(null);
  const [stats, setStats] = useState({ totalPayrollCost: 0, employeesPaid: 0, pendingTaxLiabilities: 0 });
  const [history, setHistory] = useState([]);

  const fetchPayroll = async () => {
    setLoading(true);
    try {
      const [cycleRes, statsRes, historyRes] = await Promise.all([
        api.payroll.getCurrentCycle().catch(() => ({})),
        api.payroll.getStats().catch(() => ({})),
        api.payroll.getHistory({ limit: 10 }).catch(() => [])
      ]);

      const cycle = cycleRes?.data || cycleRes || null;
      const st = statsRes?.data || statsRes || {};
      const list = historyRes?.data || historyRes || [];

      setCurrentCycle(cycle);
      setStats({
        totalPayrollCost: st.totalPayrollCost || st.total_payroll_cost || cycle?.estimatedTotal || 0,
        employeesPaid: st.employeesPaid || st.employees_paid || cycle?.employeesCount || 0,
        pendingTaxLiabilities: st.pendingTaxLiabilities || st.pending_tax_liabilities || 0
      });
      setHistory(Array.isArray(list) ? list : []);
    } catch (error) {
      toast(error.message || 'Failed to load payroll data', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, []);

  const runPayroll = async () => {
    if (!window.confirm('Run payroll for the current cycle now?')) return;

    setRunning(true);
    try {
      const cycleId = currentCycle?.id;
      await api.payroll.calculate({ cycleId });
      await api.payroll.submit({ cycleId });
      toast('Payroll run submitted successfully', 'success');
      fetchPayroll();
    } catch (error) {
      toast(error.message || 'Failed to run payroll', 'error');
    } finally {
      setRunning(false);
    }
  };

  const ytdSpending = useMemo(() => history.reduce((acc, item) => acc + Number(item.total || item.totalAmount || item.amount || 0), 0), [history]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payroll</h1>
          <p className="text-sm text-slate-500">Manage employee compensation and tax filings.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <CurrencySelect className="w-full sm:w-auto" />
        <button onClick={runPayroll} disabled={running} className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-2 w-full sm:w-auto">
          {running ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {running ? 'Running...' : 'Run Payroll'}
        </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-xl border">
          <div className="flex justify-between items-center">
            <DollarSign className="w-6 h-6 text-green-500" />
            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">Live</span>
          </div>
          <p className="text-xs text-slate-500 mt-3">Total Payroll Cost</p>
          <h3 className="text-xl font-bold mt-1">{currency(stats.totalPayrollCost)}</h3>
        </div>

        <div className="bg-blue-600 text-white p-5 rounded-xl">
          <Calendar className="w-6 h-6 opacity-80" />
          <p className="text-xs mt-3 opacity-80">Next Pay Date</p>
          <h3 className="text-xl font-bold mt-1">{currentCycle?.scheduledDate ? new Date(currentCycle.scheduledDate).toLocaleDateString() : 'Not scheduled'}</h3>
        </div>

        <div className="bg-white p-5 rounded-xl border">
          <Users className="w-6 h-6 text-blue-500" />
          <p className="text-xs text-slate-500 mt-3">Employees Paid</p>
          <h3 className="text-xl font-bold mt-1">{stats.employeesPaid}</h3>
        </div>

        <div className="bg-white p-5 rounded-xl border">
          <FileText className="w-6 h-6 text-yellow-500" />
          <p className="text-xs text-slate-500 mt-3">Pending Tax Liabilities</p>
          <h3 className="text-xl font-bold mt-1">{currency(stats.pendingTaxLiabilities)}</h3>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="xl:col-span-2 bg-white border rounded-xl flex flex-col sm:flex-row overflow-hidden">
          <div className="bg-blue-100 w-full sm:w-40 min-h-24 sm:min-h-0 flex flex-col items-center justify-center p-4">
            <Calendar className="w-8 h-8 text-blue-600" />
            <span className="text-xs mt-2 text-blue-600 font-medium">UPCOMING CYCLE</span>
          </div>

          <div className="flex-1 p-4 sm:p-6 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            <div>
              <h3 className="font-semibold">Next Pay Run: {currentCycle?.name || 'Current Cycle'}</h3>
              <ul className="text-sm text-slate-500 mt-2 space-y-1">
                <li>Scheduled for {currentCycle?.scheduledDate ? new Date(currentCycle.scheduledDate).toLocaleDateString() : 'TBD'}</li>
                <li>Estimated Total: {currency(currentCycle?.estimatedTotal || stats.totalPayrollCost)}</li>
                <li className="text-green-600">Ready to review</li>
              </ul>
            </div>

            <button onClick={runPayroll} disabled={running} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-60 flex items-center justify-center gap-2 w-full lg:w-auto">
              {running ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {running ? 'Running...' : 'Review and Run'}
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <button onClick={() => navigate('/employees')} className="w-full bg-white border rounded-xl p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50">
            <div className="flex items-center gap-3"><Plus className="w-5 h-5 text-blue-600" /><span className="text-sm font-medium">Add Employee</span></div>
          </button>
          <button onClick={() => navigate('/settings')} className="w-full bg-white border rounded-xl p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50">
            <div className="flex items-center gap-3"><Settings className="w-5 h-5 text-blue-600" /><span className="text-sm font-medium">Payroll Settings</span></div>
          </button>
          <button onClick={() => navigate('/reports')} className="w-full bg-white border rounded-xl p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50">
            <div className="flex items-center gap-3"><FileText className="w-5 h-5 text-blue-600" /><span className="text-sm font-medium">Tax Forms</span></div>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        <div className="xl:col-span-2 bg-white border rounded-xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 gap-3">
            <h3 className="font-semibold">Recent Employee Payments</h3>
            <button onClick={() => navigate('/reports')} className="text-blue-600 text-sm">View All</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead className="text-slate-500">
                <tr>
                  <th className="text-left py-2">Cycle</th>
                  <th className="text-left">Employees</th>
                  <th className="text-left">Amount</th>
                  <th className="text-left">Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="border-t">
                {history.slice(0, 5).map((item, index) => {
                  const status = (item.status || 'processed').toLowerCase();
                  const statusClass = status === 'paid' ? 'text-green-600 bg-green-100' : status === 'processed' ? 'text-blue-600 bg-blue-100' : 'text-amber-600 bg-amber-100';

                  return (
                    <tr key={item.id || index} className="border-b">
                      <td className="py-3">{item.name || item.period || `Cycle ${index + 1}`}</td>
                      <td>{item.employeesCount || item.employeeCount || '-'}</td>
                      <td>{currency(item.total || item.totalAmount || item.amount)}</td>
                      <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}</td>
                      <td><span className={`text-xs px-2 py-1 rounded ${statusClass}`}>{status}</span></td>
                    </tr>
                  );
                })}
                {history.length === 0 && (<tr><td colSpan="5" className="py-8 text-center text-slate-500">No payroll history found.</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-6">
          <p className="text-sm opacity-70">YTD Spending</p>
          <h2 className="text-2xl font-bold mt-2">{currency(ytdSpending)}</h2>
          <div className="mt-6 flex items-end gap-2 h-20">
            <div className="bg-slate-700 w-6 h-8 rounded"></div>
            <div className="bg-slate-700 w-6 h-10 rounded"></div>
            <div className="bg-slate-700 w-6 h-6 rounded"></div>
            <div className="bg-blue-500 w-6 h-14 rounded"></div>
            <div className="bg-slate-700 w-6 h-7 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
