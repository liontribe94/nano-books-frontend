import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Plus, Menu } from 'lucide-react';

export default function Header({ onMenuClick }) {
    const navigate = useNavigate();

    return (
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 z-10 sticky top-0 gap-4">
            <div className="flex items-center gap-4 flex-1 max-w-xl">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
                >
                    <Menu className="w-6 h-6" />
                </button>

                <div className="relative group flex-1 hidden sm:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors w-5 h-5" />
                    <input
                        className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-transparent focus:border-primary focus:ring-0 rounded-lg text-sm transition-all focus:outline-none border-2"
                        placeholder="Search..."
                        type="text"
                    />
                </div>

                <button className="sm:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                    <Search className="w-5 h-5" />
                </button>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <button className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Bell className="w-5 h-5" />
                </button>
                <button
                    onClick={() => navigate('/expenses/new')}
                    className="bg-primary hover:bg-primary/90 text-white p-2 sm:px-4 sm:py-2 rounded-lg text-sm font-medium flex items-center gap-2 shadow-sm shadow-primary/20 transition-colors"
                >
                    <Plus className="w-5 h-5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">New Transaction</span>
                </button>
            </div>
        </header>
    );
}
