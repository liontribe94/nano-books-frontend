import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    ShoppingBag,
    FileText,
    Banknote,
    Package,
    Receipt,
    Wallet,
    BarChart3,
    HelpCircle,
    Settings,
    Landmark,
    X
} from 'lucide-react';
import { cn } from '../../lib/utils';

const SidebarItem = ({ icon: Icon, label, to, active, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors",
            active
                ? "bg-primary/10 text-primary"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
        )}
    >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
    </Link>
);

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation();

    const mainNav = [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
        { icon: Users, label: 'Employees', to: '/employees' },
        { icon: ShoppingBag, label: 'Sales', to: '/sales' },
        { icon: FileText, label: 'Invoicing', to: '/invoicing' },
        { icon: Banknote, label: 'Payroll', to: '/payroll' },
        { icon: Package, label: 'Inventory', to: '/inventory' },
        { icon: Receipt, label: 'Expenses', to: '/expenses' },
        { icon: Wallet, label: 'Banking', to: '/banking' },
        { icon: BarChart3, label: 'Reports', to: '/reports' },
    ];

    const supportNav = [
        { icon: HelpCircle, label: 'Help Center', to: '/help' },
        { icon: Settings, label: 'Settings', to: '/settings' },
    ];

    return (
        <aside className={cn(
            "fixed inset-y-0 left-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 z-50 lg:static lg:translate-x-0 w-64",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <Landmark className="text-white w-5 h-5" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">Nano Books</span>
                </div>
                <button
                    onClick={onClose}
                    className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <nav className="flex-1 px-4 space-y-1 overflow-y-auto custom-scrollbar">
                <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Main Menu</p>
                {mainNav.map((item) => (
                    <SidebarItem
                        key={item.label}
                        {...item}
                        active={location.pathname === item.to}
                        onClick={onClose}
                    />
                ))}

                <div className="pt-6">
                    <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Support</p>
                    {supportNav.map((item) => (
                        <SidebarItem
                            key={item.label}
                            {...item}
                            active={location.pathname === item.to}
                            onClick={onClose}
                        />
                    ))}
                </div>
            </nav>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex items-center gap-3">
                    <img
                        className="w-10 h-10 rounded-full border border-white dark:border-slate-700"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAIxKCiBZW3oPpkLFD6MBdDk25XrvyLMGXKu5YVTe2F0Q82Sj06g3UgSIh6zitgj876Hq8ich4WSx4fRg4AP4AfzTcCsnR3aKBE4Sts7vKMnqROt9lyoBK4tNQ8Fa8DfnylmRYyXAmza6GvGsOjcECGtFVl0FnPSetEFkpiLM84at3cziyw7xa8D1ZevwlvJcE0iznHFZ8JzwCWWCiPn4WOaze2WXqi7B3Y0U7vaZax1RWgU8IpY4Dh1GdqbPXO7RaaFOl5itn06C2k"
                        alt="User avatar"
                    />
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">Alex Henderson</p>
                        <p className="text-xs text-slate-500 truncate">Pro Accountant</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
