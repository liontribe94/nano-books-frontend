import React from "react";
import {
  Calendar,
  DollarSign,
  Users,
  FileText,
  Plus,
  Settings
} from "lucide-react";

export default function PayrollDashboard() {
  return (
    <div className="p-8 space-y-8">

      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payroll</h1>
          <p className="text-sm text-slate-500">
            Manage employee compensation and tax filings.
          </p>
        </div>

        <button className="bg-blue-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-blue-700">
          Run Payroll
        </button>
      </div>

      {/* Stats */}

      <div className="grid grid-cols-4 gap-6">

        <div className="bg-white p-5 rounded-xl border">
          <div className="flex justify-between items-center">
            <DollarSign className="w-6 h-6 text-green-500" />
            <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
              +2.4%
            </span>
          </div>

          <p className="text-xs text-slate-500 mt-3">Total Payroll Cost</p>

          <h3 className="text-xl font-bold mt-1">$45,200.00</h3>
        </div>

        <div className="bg-blue-600 text-white p-5 rounded-xl">
          <Calendar className="w-6 h-6 opacity-80" />

          <p className="text-xs mt-3 opacity-80">Next Pay Date</p>

          <h3 className="text-xl font-bold mt-1">Oct 25, 2023</h3>
        </div>

        <div className="bg-white p-5 rounded-xl border">
          <Users className="w-6 h-6 text-blue-500" />

          <p className="text-xs text-slate-500 mt-3">Employees Paid</p>

          <h3 className="text-xl font-bold mt-1">24</h3>
        </div>

        <div className="bg-white p-5 rounded-xl border">
          <FileText className="w-6 h-6 text-yellow-500" />

          <p className="text-xs text-slate-500 mt-3">Pending Tax Liabilities</p>

          <h3 className="text-xl font-bold mt-1">$8,120.50</h3>
        </div>

      </div>

      {/* Next Pay Run */}

      <div className="grid grid-cols-3 gap-6">

        <div className="col-span-2 bg-white border rounded-xl flex overflow-hidden">

          <div className="bg-blue-100 w-40 flex flex-col items-center justify-center">
            <Calendar className="w-8 h-8 text-blue-600" />
            <span className="text-xs mt-2 text-blue-600 font-medium">
              UPCOMING CYCLE
            </span>
          </div>

          <div className="flex-1 p-6 flex justify-between items-center">

            <div>
              <h3 className="font-semibold">
                Next Pay Run: October Cycle
              </h3>

              <ul className="text-sm text-slate-500 mt-2 space-y-1">
                <li>Scheduled for October 25, 2023</li>
                <li>Estimated Total: $22,600.00</li>
                <li className="text-green-600">Ready to review</li>
              </ul>
            </div>

            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">
              Review and Run
            </button>

          </div>

        </div>

        {/* Quick Actions */}

        <div className="space-y-4">

          <div className="bg-white border rounded-xl p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <Plus className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Add Employee</span>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Payroll Settings</span>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Tax Forms</span>
            </div>
          </div>

        </div>

      </div>

      {/* Bottom Section */}

      <div className="grid grid-cols-3 gap-6">

        {/* Recent Payments */}

        <div className="col-span-2 bg-white border rounded-xl p-6">

          <div className="flex justify-between mb-4">
            <h3 className="font-semibold">Recent Employee Payments</h3>
            <button className="text-blue-600 text-sm">View All</button>
          </div>

          <table className="w-full text-sm">
            <thead className="text-slate-500">
              <tr>
                <th className="text-left py-2">Name</th>
                <th className="text-left">Role</th>
                <th className="text-left">Pay Type</th>
                <th className="text-left">Last Paid</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody className="border-t">

              <tr className="border-b">
                <td className="py-3">Jane Doe</td>
                <td>Senior Designer</td>
                <td>Salary</td>
                <td>Sep 25</td>
                <td>
                  <span className="text-green-600 text-xs bg-green-100 px-2 py-1 rounded">
                    Active
                  </span>
                </td>
              </tr>

              <tr className="border-b">
                <td className="py-3">Mark Smith</td>
                <td>Lead Dev</td>
                <td>Salary</td>
                <td>Sep 25</td>
                <td>
                  <span className="text-green-600 text-xs bg-green-100 px-2 py-1 rounded">
                    Active
                  </span>
                </td>
              </tr>

              <tr className="border-b">
                <td className="py-3">Alice Wong</td>
                <td>Marketing</td>
                <td>Hourly</td>
                <td>Oct 10</td>
                <td>
                  <span className="text-blue-600 text-xs bg-blue-100 px-2 py-1 rounded">
                    Contract
                  </span>
                </td>
              </tr>

            </tbody>

          </table>

        </div>

        {/* YTD Spending */}

        <div className="bg-slate-900 text-white rounded-xl p-6">

          <p className="text-sm opacity-70">YTD Spending</p>

          <h2 className="text-2xl font-bold mt-2">$542,800</h2>

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