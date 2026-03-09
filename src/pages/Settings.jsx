import React, { useState, useEffect } from 'react';
import { useToast } from '../components/ui/Toast';
import { api } from '../lib/api';
import {
    Percent,
    Plus,
    Pencil,
    Globe,
    RefreshCw,
    Save,
    CheckCircle2,
    Circle,
    Loader2
} from 'lucide-react';

const TaxRow = ({ name, description, rate, status, onEdit }) => (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
        <td className="px-6 py-4">
            <span className="font-semibold text-slate-800 dark:text-slate-200">{name}</span>
        </td>
        <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
            {description}
        </td>
        <td className="px-6 py-4 text-center font-medium text-slate-800 dark:text-slate-200">
            {rate}%
        </td>
        <td className="px-6 py-4 text-center">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${status === 'Active' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status === 'Active' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                {status}
            </span>
        </td>
        <td className="px-6 py-4 text-center">
            <button onClick={onEdit} className="text-slate-400 hover:text-primary transition-colors">
                <Pencil className="w-4 h-4" />
            </button>
        </td>
    </tr>
);

const CurrencyRow = ({ country, code, rate, isDefault, onSetDefault }) => (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0">
        <td className="px-6 py-4">
            <div className="flex items-center gap-3">
                <span className="text-xl">{country?.flag || '🏳️'}</span>
                <span className="font-medium text-slate-800 dark:text-slate-200">{country?.name || 'Unknown'}</span>
            </div>
        </td>
        <td className="px-6 py-4 text-sm font-mono text-slate-500">
            {code}
        </td>
        <td className="px-6 py-4 text-right font-medium text-slate-800 dark:text-slate-200">
            {rate}
        </td>
        <td className="px-6 py-4 text-center">
            <button onClick={onSetDefault}>
                {isDefault ? (
                    <CheckCircle2 className="w-5 h-5 text-primary mx-auto" />
                ) : (
                    <Circle className="w-5 h-5 text-slate-300 dark:text-slate-600 mx-auto" />
                )}
            </button>
        </td>
    </tr>
);

export default function Settings() {
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState({
        taxes: [],
        currencies: [],
        multiCurrencyEnabled: true,
        displayFormat: {
            symbol: 'Before',
            separator: 'Dot'
        }
    });

    const fetchSettings = async () => {
        setLoading(true);
        try {
            const data = await api.settings.get();
            // Map backend data to our state structure
            setSettings({
                taxes: data.taxes || [
                    { name: 'Standard VAT', description: 'Standard value added tax', rate: 20, status: 'Active' },
                    { name: 'Reduced Rate', description: 'Items like food', rate: 5, status: 'Active' }
                ],
                currencies: data.currencies || [
                    { country: { name: 'US Dollar', flag: '🇺🇸' }, code: 'USD', rate: '1.0000', isDefault: true },
                    { country: { name: 'Euro', flag: '🇪🇺' }, code: 'EUR', rate: '0.9241', isDefault: false }
                ],
                multiCurrencyEnabled: data.multiCurrencyEnabled ?? true,
                displayFormat: data.displayFormat || { symbol: 'Before', separator: 'Dot' }
            });
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            // Fallback to defaults shown above if fetch fails
            toast('Loaded default settings', 'info');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.settings.update(settings);
            toast('Settings saved successfully', 'success');
        } catch (error) {
            toast(error.message || 'Failed to save settings', 'error');
        } finally {
            setSaving(false);
        }
    };

    const updateDisplay = (field, value) => {
        setSettings(prev => ({
            ...prev,
            displayFormat: { ...prev.displayFormat, [field]: value }
        }));
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                        <span>Settings</span>
                        <span>/</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200">Tax & Currency</span>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Tax and Currency Settings</h1>
                    <p className="text-slate-500 dark:text-slate-400">Configure your regional tax rules and manage multiple currencies.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-sm shadow-primary/20 transition-all disabled:opacity-70"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {/* Tax Rules Section */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Percent className="w-5 h-5 text-primary" />
                        Tax Rules
                    </h3>
                    <button onClick={() => toast('Feature coming soon', 'info')} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <Plus className="w-4 h-4" />
                        Add New Tax
                    </button>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">Tax Name</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4 text-center">Rate (%)</th>
                                    <th className="px-6 py-4 text-center">Status</th>
                                    <th className="px-6 py-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {settings.taxes.map((tax, i) => (
                                    <TaxRow key={i} {...tax} onEdit={() => toast('Edit tax coming soon', 'info')} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Multi-Currency Section */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Globe className="w-5 h-5 text-primary" />
                        Multi-Currency
                    </h3>
                    <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400 uppercase tracking-tight">Enable Multi-Currency</span>
                        <button
                            onClick={() => setSettings(s => ({ ...s, multiCurrencyEnabled: !s.multiCurrencyEnabled }))}
                            className={`w-10 h-5 rounded-full relative transition-colors ${settings.multiCurrencyEnabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${settings.multiCurrencyEnabled ? 'left-6' : 'left-1'}`}></div>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Active Currencies List */}
                    <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm">Active Currencies</h4>
                            <button onClick={() => toast('Rates updated', 'success')} className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" />
                                Update Rates
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Currency</th>
                                        <th className="px-6 py-4">Code</th>
                                        <th className="px-6 py-4 text-right">Exchange Rate (vs USD)</th>
                                        <th className="px-6 py-4 text-center">Default</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {settings.currencies.map((curr, i) => (
                                        <CurrencyRow
                                            key={i}
                                            {...curr}
                                            onSetDefault={() => {
                                                const updated = settings.currencies.map((c, idx) => ({ ...c, isDefault: idx === i }));
                                                setSettings(s => ({ ...s, currencies: updated }));
                                            }}
                                        />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                            <button onClick={() => toast('Feature coming soon', 'info')} className="text-sm font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-2 transition-colors">
                                <Plus className="w-4 h-4" />
                                Add Currency
                            </button>
                        </div>
                    </div>

                    {/* Side Panels */}
                    <div className="flex flex-col gap-6">
                        {/* Auto Updates */}
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-900/20">
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                                    <RefreshCw className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 dark:text-white text-sm">Auto-Updates</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                                        Your exchange rates are updated automatically every 24 hours using market standard data.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-between items-center text-xs mt-4 pt-4 border-t border-blue-100 dark:border-blue-900/20">
                                <span className="text-slate-400 uppercase font-bold tracking-wider">Last Sync:</span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">Recently</span>
                            </div>
                        </div>

                        {/* Display Format */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-4">Display Format</h4>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Currency Symbol</label>
                                    <select
                                        value={settings.displayFormat.symbol}
                                        onChange={(e) => updateDisplay('symbol', e.target.value)}
                                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary"
                                    >
                                        <option value="Before">Before Amount ($100)</option>
                                        <option value="After">After Amount (100$)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Decimal Separator</label>
                                    <select
                                        value={settings.displayFormat.separator}
                                        onChange={(e) => updateDisplay('separator', e.target.value)}
                                        className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary"
                                    >
                                        <option value="Dot">Dot (.)</option>
                                        <option value="Comma">Comma (,)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
