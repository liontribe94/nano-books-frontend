import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, ArrowLeft } from 'lucide-react';

const tiers = [
    {
        name: 'Starter',
        price: { monthly: 7000, yearly: 70000 },
        description: 'Perfect for freelancers and small tasks.',
        features: [
            'Up to 5 Clients',
            'Basic Invoicing',
            'Expense Tracking',
            '1 User Account'
        ],
        notIncluded: [
            'Inventory Management',
            'Payroll Processing',
            'Advanced Reports',
            'Priority Support'
        ],
        cta: 'Get Started',
        popular: false
    },
    {
        name: 'Pro',
        price: { monthly: 19000, yearly: 190000 },
        description: 'Best for growing businesses needing full power.',
        features: [
            'Unlimited Clients',
            'Advanced Invoicing & Estimates',
            'Full Inventory Management',
            'Payroll for up to 10 Employees',
            '3 User Accounts',
            'AI-Powered Insights'
        ],
        notIncluded: [
            'Dedicated Account Manager',
            'API Access'
        ],
        cta: 'Start 14-Day Free Trial',
        popular: true
    },
    {
        name: 'Enterprise',
        price: { monthly: 49000, yearly: 490000 },
        description: 'For large teams and complex needs.',
        features: [
            'Unlimited Everything',
            'Custom Payroll Solutions',
            'Dedicated Account Manager',
            'API Access & Integrations',
            'SSO & Advanced Security',
            'Priority 24/7 Support'
        ],
        notIncluded: [],
        cta: 'Contact Sales',
        popular: false
    }
];

export default function Pricing() {
    const navigate = useNavigate();
    const [annual, setAnnual] = useState(true);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-primary/30 pb-20">
            {/* ── Navbar ── */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30">
                            N
                        </div>
                        <span className="font-bold text-xl tracking-tight">Nano<span className="text-primary">Books</span></span>
                    </div>
                    <button onClick={() => navigate('/login')} className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
                        Log In
                    </button>
                </div>
            </nav>

            <div className="pt-32 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
                        Simple, transparent pricing
                    </h1>
                    <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
                        Choose the plan that's right for your business. No hidden fees, ever.
                    </p>

                    {/* Toggle */}
                    <div className="flex items-center justify-center gap-4">
                        <span className={`text-sm font-medium ${!annual ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>Monthly</span>
                        <button
                            onClick={() => setAnnual(!annual)}
                            className={`w-14 h-8 rounded-full p-1 transition-colors ${annual ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform ${annual ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                        <span className={`text-sm font-medium ${annual ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>
                            Yearly <span className="text-emerald-500 text-xs bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full ml-1">Save 20%</span>
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {tiers.map((tier, idx) => (
                        <div key={idx} className={`relative flex flex-col p-8 rounded-2xl transition-all ${tier.popular
                            ? 'bg-white dark:bg-slate-900 border-2 border-primary shadow-2xl shadow-primary/10 scale-105 z-10'
                            : 'bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-primary/30 hover:shadow-xl'
                            }`}>
                            {tier.popular && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold uppercase tracking-widest py-1 px-3 rounded-full shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{tier.name}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 min-h-[40px]">{tier.description}</p>

                            <div className="mb-8">
                                <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                                    ₦{(annual ? tier.price.yearly : tier.price.monthly).toLocaleString()}
                                </span>
                                <span className="text-slate-500 dark:text-slate-400">/{annual ? 'year' : 'month'}</span>
                            </div>

                            <button onClick={() => navigate('/signup')} className={`w-full py-3 rounded-xl font-bold transition-all mb-8 ${tier.popular
                                ? 'bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25'
                                : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
                                }`}>
                                {tier.cta}
                            </button>

                            <div className="space-y-4 flex-1">
                                {tier.features.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3" />
                                        </div>
                                        <span className="text-sm text-slate-700 dark:text-slate-300">{feature}</span>
                                    </div>
                                ))}
                                {tier.notIncluded.map((feature, i) => (
                                    <div key={i} className="flex items-start gap-3 opacity-50">
                                        <div className="mt-0.5 w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center flex-shrink-0">
                                            <X className="w-3 h-3" />
                                        </div>
                                        <span className="text-sm text-slate-500">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 text-center">
                    <p className="text-slate-500 dark:text-slate-400">
                        Have questions? <a href="#" className="text-primary font-semibold hover:underline">Contact our sales team</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
