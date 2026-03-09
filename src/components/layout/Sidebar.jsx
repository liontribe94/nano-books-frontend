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
    LogOut,
    X
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, to, active, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors',
            active
                ? 'bg-primary/10 text-primary'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
        )}
    >
        <Icon className="w-5 h-5" />
        <span>{label}</span>
    </Link>
);

const canViewNavItem = (role, navRole) => {
    if (!navRole) return true;
    if (Array.isArray(navRole)) return navRole.includes(role);
    return navRole === role;
};

export default function Sidebar({ isOpen, onClose }) {
    const location = useLocation();
    const { user, logout } = useAuth();
    const currentUser = user?.user ?? user;
    const role = currentUser?.role || 'viewer';

    const displayName =
        currentUser?.name ||
        currentUser?.fullName ||
        currentUser?.username ||
        currentUser?.email ||
        'User';
    const subtitle =
        currentUser?.companyName ||
        role ||
        currentUser?.email ||
        'Signed in';
    const avatarUrl = currentUser?.avatar || currentUser?.photo || currentUser?.profilePicture;
    const initials = displayName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() || '')
        .join('');

    const mainNav = [
        { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
        { icon: Users, label: 'Employees', to: '/employees', roles: ['admin'] },
        { icon: ShoppingBag, label: 'Sales', to: '/sales' },
        { icon: FileText, label: 'Invoicing', to: '/invoicing', roles: ['admin', 'accountant'] },
        { icon: Banknote, label: 'Payroll', to: '/payroll', roles: ['admin'] },
        { icon: Package, label: 'Inventory', to: '/inventory', roles: ['admin', 'accountant'] },
        { icon: Receipt, label: 'Expenses', to: '/expenses', roles: ['admin', 'accountant'] },
        { icon: Wallet, label: 'Banking', to: '/banking' },
        { icon: BarChart3, label: 'Reports', to: '/reports' },
    ].filter((item) => canViewNavItem(role, item.roles));

    const supportNav = [
        { icon: HelpCircle, label: 'Help Center', to: '/help' },
        { icon: Settings, label: 'Settings', to: '/settings' },
    ];

    return (
        <aside className={cn(
            'fixed inset-y-0 left-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col transition-all duration-300 z-50 lg:static lg:translate-x-0 w-64',
            isOpen ? 'translate-x-0' : '-translate-x-full'
        )}>
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30">
                        N
                    </div>
                    <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white">Nano<span className="text-primary">Books</span></span>
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
                    <button
                        onClick={() => {
                            logout();
                            onClose?.();
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </nav>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 flex items-center gap-3">
                    {avatarUrl ? (
                        <img
                            className="w-10 h-10 rounded-full border border-white dark:border-slate-700 object-cover"
                            src={avatarUrl}
                            alt={`${displayName} avatar`}
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full border border-white dark:border-slate-700 bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm">
                            {initials || 'U'}
                        </div>
                    )}
                    <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">{displayName}</p>
                        <p className="text-xs text-slate-500 truncate">{subtitle}</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
