import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

export default function Login() {
    const location = useLocation();
    const isLogin = location.pathname === '/login';
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        companyName: ''
    });

    const { login, register } = useAuth();
    const navigate = useNavigate();
    const toast = useToast();

    const from = location.state?.from?.pathname || "/dashboard";

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (isLogin) {
                await login(formData.email, formData.password);
                toast('Welcome back!', 'success');
            } else {
                await register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    companyName: formData.companyName
                });
                toast('Account created successfully!', 'success');
            }
            navigate(from, { replace: true });
        } catch (error) {
            toast(error.message || 'Authentication failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">

                {/* Left Side - Form */}
                <div className="p-8 md:p-12 flex flex-col justify-center order-2 md:order-1">
                    <div className="mb-8 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary text-white font-bold text-xl shadow-lg shadow-primary/30 flex items-center justify-center">
                                N
                            </div>
                            <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">Nano<span className="text-primary">Books</span></span>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                            {isLogin ? 'Welcome back' : 'Create an account'}
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            {isLogin ? 'Enter your details to access your account.' : 'Start your 14-day free trial today.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {!isLogin && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Company Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <div className="w-5 h-5 flex items-center justify-center font-bold text-xs border border-current rounded">C</div>
                                        </div>
                                        <input
                                            type="text"
                                            name="companyName"
                                            required
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                            placeholder="Acme Inc."
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-500">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                            <button
                                onClick={() => navigate(isLogin ? '/signup' : '/login')}
                                className="font-semibold text-primary hover:text-primary/80 transition-colors"
                            >
                                {isLogin ? 'Sign up for free' : 'Sign in'}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Right Side - Image/Feature */}
                <div className="relative hidden md:block order-1 md:order-2 bg-slate-900 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-purple-600/80 z-10"></div>
                    <img
                        src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2670&auto=format&fit=crop"
                        alt="Background"
                        className="absolute inset-0 w-full h-full object-cover opacity-50 grayscale mix-blend-multiply"
                    />
                    <div className="relative z-20 h-full flex flex-col justify-between p-12 text-white">
                        <div className="flex justify-end">
                            <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium">
                                Enterprise Edition
                            </div>
                        </div>
                        <div>
                            <h3 className="text-3xl font-bold mb-4 leading-tight">
                                "NanoBooks transformed how we manage our global inventory."
                            </h3>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/20"></div>
                                <div>
                                    <p className="font-bold">Sarah Chen</p>
                                    <p className="text-sm text-white/70">CTO at TechFlow</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
