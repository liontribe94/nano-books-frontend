import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight,
    BarChart3,
    PieChart,
    ShieldCheck,
    Zap,
    CheckCircle2,
    ArrowRight
} from 'lucide-react';

export default function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/30">
            {/* ── Navbar ── */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary/30">
                            N
                        </div>
                        <span className="font-bold text-xl tracking-tight">Nano<span className="text-primary">Books</span></span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-400">
                        <a href="#features" className="hover:text-primary transition-colors">Features</a>
                        <button onClick={() => navigate('/pricing')} className="hover:text-primary transition-colors">Pricing</button>
                        <a href="#testimonials" className="hover:text-primary transition-colors">Testimonials</a>
                        <a href="#about" className="hover:text-primary transition-colors">About</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/login')} className="text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">
                            Log In
                        </button>
                        <button onClick={() => navigate('/signup')} className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-full text-sm font-bold shadow-lg shadow-primary/25 transition-all hover:scale-105 active:scale-95">
                            Get Started
                        </button>
                    </div>
                </div>
            </nav>

            {/* ── Hero Section ── */}
            <section className="relative pt-32 pb-20 ovrflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
                    <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400 mb-8 animate-fade-in-up">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        New: AI-Powered Inventory Forecasting
                    </div>
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-slate-400 bg-clip-text text-transparent">
                        Accounting made <br className="hidden md:block" />
                        <span className="text-primary">simple & powerful.</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Manage your finances, inventory, and payroll in one intuitive platform.
                        Designed for modern businesses that need clarity, not complexity.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={() => navigate('/signup')} className="px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-full font-bold text-lg shadow-xl shadow-primary/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                            Start Free Trial <ChevronRight className="w-5 h-5" />
                        </button>
                        <button className="px-8 py-4 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-white rounded-full font-bold text-lg border border-slate-200 dark:border-slate-800 shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">▶</span> Watch Demo
                        </button>
                    </div>

                    {/* Dashboard Preview Mockup */}
                    <div className="mt-20 relative mx-auto max-w-5xl">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-20"></div>
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900">
                            <img
                                src="https://ui.aceternity.com/_next/image?url=https%3A%2F%2Fimages.unsplash.com%2Fphoto-1551288049-bebda4e38f71%3Fq%3D80%26w%3D2670%26auto%3Dformat%26fit%3Dcrop%26ixlib%3Drb-4.0.3%26ixid%3DM3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%253D%253D&w=1920&q=75"
                                alt="Dashboard Preview"
                                className="w-full h-auto object-cover opacity-90"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-50/50 dark:from-slate-950/50 to-transparent pointer-events-none"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Features Grid ── */}
            <section id="features" className="py-24 bg-white dark:bg-slate-900">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to grow</h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                            Stop juggling multiple spreadsheets and apps. command your entire business from a single, powerful dashboard.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-primary/50 transition-colors group">
                            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-500/10 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <BarChart3 className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Financial Analytics</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Real-time insights into your revenue, expenses, and cash flow. Make data-driven decisions instantly.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-primary/50 transition-colors group">
                            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <Zap className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Smart Automation</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Automate invoicing, payroll calculations, and inventory reordering. Save hours every week.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:border-primary/50 transition-colors group">
                            <div className="w-14 h-14 bg-purple-100 dark:bg-purple-500/10 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <ShieldCheck className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold mb-3">Enterprise Security</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                                Bank-grade encryption and role-based access control to keep your sensitive business data safe.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── Social Proof / Trust ── */}
            <section className="py-20 border-t border-slate-100 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-8">Trusted by 10,000+ businesses worldwide</p>
                    <div className="flex flex-wrap justify-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {['Acme Corp', 'GlobalTech', 'Nebula', 'Velocity', 'FoxRun'].map((brand, i) => (
                            <span key={i} className="text-2xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                <div className="w-8 h-8 rounded bg-slate-300 dark:bg-slate-700"></div> {brand}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA Section ── */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/90 dark:bg-primary/20"></div>
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl font-bold text-white mb-6">Ready to streamline your business?</h2>
                    <p className="text-xl text-white/90 mb-10">Join thousands of companies using NanoBooks to manage their success.</p>
                    <button onClick={() => navigate('/signup')} className="px-10 py-4 bg-white text-primary rounded-full font-bold text-lg shadow-xl hover:bg-slate-50 transition-colors">
                        Get Started Now
                    </button>
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div className="col-span-2">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">N</div>
                            <span className="font-bold text-xl text-white tracking-tight">NanoBooks</span>
                        </div>
                        <p className="max-w-xs text-sm">Simplifying business management for the modern era. Built with ❤️ by NanoTeams.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Product</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#features" className="hover:text-primary">Features</a></li>
                            <li><button onClick={() => navigate('/pricing')} className="hover:text-primary text-left">Pricing</button></li>
                            <li><a href="#" className="hover:text-primary">Enterprise</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Legals</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-primary">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-primary">Terms of Service</a></li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    );
}
