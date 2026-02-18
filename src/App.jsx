import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/ui/Toast';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Sales from './pages/Sales';
import Employees from './pages/Employees';
import Invoicing from './pages/Invoicing';
import Payroll from './pages/Payroll';
import Inventory from './pages/Inventory';
import AddProduct from './pages/AddProduct';
import Expenses from './pages/Expenses';
import LandingPage from './pages/LandingPage';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AddExpense from './pages/AddExpense';
import Banking from './pages/Banking';
import Reports from './pages/Reports';
import HelpCenter from './pages/HelpCenter';
import Settings from './pages/Settings';
import PlaceholderPage from './pages/PlaceholderPage';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Login />} />

            {/* App Routes wrapped in Layout and ProtectedRoute */}
            <Route element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="employees" element={<Employees />} />
              <Route path="sales" element={<Sales />} />
              <Route path="invoicing" element={<Invoicing />} />
              <Route path="payroll" element={<Payroll />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="inventory/new" element={<AddProduct />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="expenses/new" element={<AddExpense />} />
              <Route path="banking" element={<Banking />} />
              <Route path="reports" element={<Reports />} />
              <Route path="help" element={<HelpCenter />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<PlaceholderPage title="Not Found" />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
