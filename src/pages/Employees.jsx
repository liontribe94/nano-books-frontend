import React from "react";
import {
  Users,
  UserCheck,
  UserX,
  Plus,
  Filter,
  Download,
  Eye,
  Pencil
} from "lucide-react";

export default function EmployeesDashboard() {
  const employees = [
    {
      name: "John Doe",
      email: "john.doe@acme.com",
      role: "Senior Accountant",
      department: "Finance",
      status: "Active",
    },
    {
      name: "Jane Smith",
      email: "jane.smith@acme.com",
      role: "Audit Manager",
      department: "Compliance",
      status: "Active",
    },
    {
      name: "Robert Brown",
      email: "robert.b@acme.com",
      role: "Tax Specialist",
      department: "Finance",
      status: "On Leave",
    },
    {
      name: "Emily White",
      email: "emily.w@acme.com",
      role: "HR Coordinator",
      department: "Operations",
      status: "Active",
    },
    {
      name: "Michael Scott",
      email: "m.scott@acme.com",
      role: "Regional Manager",
      department: "Sales",
      status: "Terminated",
    },
  ];

  const statusStyle = (status) => {
    if (status === "Active")
      return "bg-green-100 text-green-600";
    if (status === "On Leave")
      return "bg-yellow-100 text-yellow-700";
    if (status === "Terminated")
      return "bg-gray-200 text-gray-600";
  };

  return (
    <div className="p-8 space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Employees</h1>
          <p className="text-sm text-slate-500">
            Manage your workforce and organizational hierarchy.
          </p>
        </div>

        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-3 gap-6">

        <div className="bg-white border rounded-xl p-5">
          <Users className="w-6 h-6 text-blue-500" />
          <p className="text-xs text-slate-500 mt-3">Total Employees</p>
          <h3 className="text-xl font-bold mt-1">124</h3>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <UserCheck className="w-6 h-6 text-green-500" />
          <p className="text-xs text-slate-500 mt-3">Active Employees</p>
          <h3 className="text-xl font-bold mt-1">118</h3>
        </div>

        <div className="bg-white border rounded-xl p-5">
          <UserX className="w-6 h-6 text-yellow-500" />
          <p className="text-xs text-slate-500 mt-3">On Leave</p>
          <h3 className="text-xl font-bold mt-1">6</h3>
        </div>

      </div>

      {/* Employees Table */}

      <div className="bg-white border rounded-xl">

        {/* Table Controls */}

        <div className="flex justify-between items-center p-4 border-b">

          <div className="flex gap-4 text-sm">
            <button className="text-blue-600 font-medium border-b-2 border-blue-600 pb-1">
              All Employees
            </button>

            <button className="text-slate-500 hover:text-slate-800">
              By Department
            </button>
          </div>

          <div className="flex gap-3">

            <button className="flex items-center gap-1 text-sm border px-3 py-1 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4" />
              Filter
            </button>

            <button className="flex items-center gap-1 text-sm border px-3 py-1 rounded-lg hover:bg-gray-50">
              <Download className="w-4 h-4" />
              Export
            </button>

          </div>

        </div>

        {/* Table */}

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

            {employees.map((emp, index) => (
              <tr key={index} className="border-b hover:bg-gray-50">

                <td className="p-4">
                  <div>
                    <p className="font-medium">{emp.name}</p>
                    <p className="text-xs text-slate-500">{emp.email}</p>
                  </div>
                </td>

                <td>{emp.role}</td>

                <td>{emp.department}</td>

                <td>
                  <span
                    className={`text-xs px-2 py-1 rounded ${statusStyle(
                      emp.status
                    )}`}
                  >
                    {emp.status}
                  </span>
                </td>

                <td className="flex gap-2 justify-center">
                  <Eye className="w-4 h-4 cursor-pointer text-slate-500 hover:text-slate-800" />
                  <Pencil className="w-4 h-4 cursor-pointer text-slate-500 hover:text-slate-800" />
                </td>

              </tr>
            ))}

          </tbody>

        </table>

        {/* Pagination */}

        <div className="flex justify-between items-center p-4 text-xs text-slate-500">

          <p>Showing 1 to 5 of 124 entries</p>

          <div className="flex gap-2">
            <button className="px-2 py-1 border rounded bg-blue-600 text-white">
              1
            </button>
            <button className="px-2 py-1 border rounded">2</button>
            <button className="px-2 py-1 border rounded">3</button>
          </div>

        </div>

      </div>

    </div>
  );
}