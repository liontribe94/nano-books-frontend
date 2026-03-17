import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api';
import {
  Users,
  UserCheck,
  UserX,
  Plus,
  Filter,
  Download,
  Eye,
  Pencil,
  Loader2
} from 'lucide-react';

const normalizeEmployee = (emp) => ({
  id: emp.id,
  name: emp.name || 'Unnamed Employee',
  email: emp.email || '-',
  role: emp.role || 'Staff',
  department: emp.department || emp.dept || 'General',
  status: emp.status || (emp.isActive === false ? 'Inactive' : 'Active')
});

export default function EmployeesDashboard() {
  const navigate = useNavigate();
  const toast = useToast();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [busyAction, setBusyAction] = useState('');

  const pageSize = 10;

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await api.employees.getAll();
      const data = res?.data || res || [];
      const normalized = Array.isArray(data) ? data.map(normalizeEmployee) : [];
      setEmployees(normalized);
    } catch (error) {
      toast(error.message || 'Failed to load employees', 'error');
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    if (statusFilter === 'all') return employees;
    if (statusFilter === 'department') return employees.filter((e) => !!e.department);
    return employees.filter((e) => (e.status || '').toLowerCase() === statusFilter);
  }, [employees, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const pagedEmployees = filteredEmployees.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [statusFilter]);

  const activeCount = employees.filter((e) => (e.status || '').toLowerCase() === 'active').length;
  const leaveCount = employees.filter((e) => (e.status || '').toLowerCase().includes('leave')).length;

  const statusStyle = (status) => {
    if ((status || '').toLowerCase() === 'active') return 'bg-green-100 text-green-600';
    if ((status || '').toLowerCase().includes('leave')) return 'bg-yellow-100 text-yellow-700';
    if ((status || '').toLowerCase().includes('inactive') || (status || '').toLowerCase().includes('terminated')) return 'bg-gray-200 text-gray-600';
    return 'bg-slate-100 text-slate-600';
  };

  const handleAddEmployee = async () => {
    const name = window.prompt('Employee full name');
    if (!name) return;
    const email = window.prompt('Employee email');
    if (!email) return;
    const role = window.prompt('Role (e.g. Accountant)', 'Accountant') || 'Accountant';
    const department = window.prompt('Department', 'Finance') || 'Finance';

    setBusyAction('add');
    try {
      await api.employees.create({ name, email, role, department });
      toast('Employee created successfully', 'success');
      fetchEmployees();
    } catch (error) {
      toast(error.message || 'Failed to create employee', 'error');
    } finally {
      setBusyAction('');
    }
  };

  const handleEditEmployee = async (employee) => {
    const role = window.prompt('Update role', employee.role);
    if (!role) return;
    const department = window.prompt('Update department', employee.department) || employee.department;
    if (!window.confirm(`Update ${employee.name}'s profile details?`)) return;

    setBusyAction(`edit-${employee.id}`);
    try {
      await api.employees.update(employee.id, { role, department });
      toast('Employee updated', 'success');
      fetchEmployees();
    } catch (error) {
      toast(error.message || 'Failed to update employee', 'error');
    } finally {
      setBusyAction('');
    }
  };

  const handleExport = () => {
    setBusyAction('export');
    const header = ['name', 'email', 'role', 'department', 'status'];
    const rows = filteredEmployees.map((e) => [e.name, e.email, e.role, e.department, e.status]);
    const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast('Employees exported', 'success');
    setBusyAction('');
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Employees</h1>
          <p className="text-sm text-slate-500">Manage your workforce and organizational hierarchy.</p>
        </div>

        <button
          onClick={handleAddEmployee}
          disabled={busyAction === 'add'}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 disabled:opacity-60"
        >
          {busyAction === 'add' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add Employee
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white border rounded-xl p-5">
          <Users className="w-6 h-6 text-blue-500" />
          <p className="text-xs text-slate-500 mt-3">Total Employees</p>
          <h3 className="text-xl font-bold mt-1">{employees.length}</h3>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <UserCheck className="w-6 h-6 text-green-500" />
          <p className="text-xs text-slate-500 mt-3">Active Employees</p>
          <h3 className="text-xl font-bold mt-1">{activeCount}</h3>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <UserX className="w-6 h-6 text-yellow-500" />
          <p className="text-xs text-slate-500 mt-3">On Leave</p>
          <h3 className="text-xl font-bold mt-1">{leaveCount}</h3>
        </div>
      </div>

      <div className="bg-white border rounded-xl">
        <div className="flex justify-between items-center p-4 border-b">
          <div className="flex gap-4 text-sm">
            <button onClick={() => setStatusFilter('all')} className={`${statusFilter === 'all' ? 'text-blue-600 font-medium border-b-2 border-blue-600 pb-1' : 'text-slate-500 hover:text-slate-800'}`}>
              All Employees
            </button>

            <button onClick={() => setStatusFilter('department')} className={`${statusFilter === 'department' ? 'text-blue-600 font-medium border-b-2 border-blue-600 pb-1' : 'text-slate-500 hover:text-slate-800'}`}>
              By Department
            </button>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStatusFilter(statusFilter === 'active' ? 'all' : 'active')}
              className="flex items-center gap-1 text-sm border px-3 py-1 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4" />
              {statusFilter === 'active' ? 'Clear Filter' : 'Active Only'}
            </button>

            <button
              onClick={handleExport}
              disabled={busyAction === 'export'}
              className="flex items-center gap-1 text-sm border px-3 py-1 rounded-lg hover:bg-gray-50 disabled:opacity-60"
            >
              {busyAction === 'export' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Export
            </button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead className="text-slate-500 text-xs">
            <tr className="border-b">
              <th className="text-left p-4">Name</th>
              <th className="text-left">Role</th>
              <th className="text-left">Department</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {pagedEmployees.map((emp) => (
              <tr key={emp.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <div>
                    <p className="font-medium">{emp.name}</p>
                    <p className="text-xs text-slate-500">{emp.email}</p>
                  </div>
                </td>

                <td>{emp.role}</td>

                <td>{emp.department}</td>

                <td>
                  <span className={`text-xs px-2 py-1 rounded ${statusStyle(emp.status)}`}>
                    {emp.status}
                  </span>
                </td>

                <td className="flex gap-2 justify-center">
                  <button onClick={() => navigate(`/employees/${emp.id}`)}>
                    <Eye className="w-4 h-4 cursor-pointer text-slate-500 hover:text-slate-800" />
                  </button>
                  <button onClick={() => handleEditEmployee(emp)} disabled={busyAction === `edit-${emp.id}`}>
                    {busyAction === `edit-${emp.id}` ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                    ) : (
                      <Pencil className="w-4 h-4 cursor-pointer text-slate-500 hover:text-slate-800" />
                    )}
                  </button>
                </td>
              </tr>
            ))}
            {pagedEmployees.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-8 text-slate-500">No employees found.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-between items-center p-4 text-xs text-slate-500">
          <p>Showing {filteredEmployees.length === 0 ? 0 : (page - 1) * pageSize + 1} to {Math.min(page * pageSize, filteredEmployees.length)} of {filteredEmployees.length} entries</p>

          <div className="flex gap-2">
            <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-2 py-1 border rounded disabled:opacity-50">Prev</button>
            <button className="px-2 py-1 border rounded bg-blue-600 text-white">{page}</button>
            <button disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="px-2 py-1 border rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
