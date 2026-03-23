import React from 'react';
import { useAuth } from '../../context/AuthContext';

const OPTIONS = [
  { code: 'USD', label: 'USD' },
  { code: 'EUR', label: 'EUR' },
  { code: 'GBP', label: 'GBP' },
  { code: 'NGN', label: 'NGN' }
];

export default function CurrencySelect({ className = '' }) {
  const { currency, setCurrency } = useAuth();

  return (
    <div className={className}>
      <label className="sr-only" htmlFor="currency-select">Currency</label>
      <select
        id="currency-select"
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="w-full sm:w-auto min-w-[90px] py-2 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:border-primary"
      >
        {OPTIONS.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
