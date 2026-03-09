import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Loader2, Mail, Lock, User, Users, CheckCircle2 } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { useAuth } from '../context/AuthContext';

export default function AcceptInvite() {
    const location = useLocation();
    const navigate = useNavigate();
    const toast = useToast();
    const { register } = useAuth();

    const token = useMemo(() => new URLSearchParams(location.search).get('token') || '', [location.search]);

    const [loading, setLoading] = useState(false);
    const [accepted, setAccepted] = useState(false);
    const [redirectIn, setRedirectIn] = useState(3);
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const update = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    useEffect(() => {
        if (!accepted) return;

        const intervalId = setInterval(() => {
            setRedirectIn((prev) => (prev > 1 ? prev - 1 : 1));
        }, 1000);

        const timeoutId = setTimeout(() => {
            navigate('/dashboard', { replace: true });
        }, 3000);

        return () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    }, [accepted, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            toast('Invitation token is missing or invalid.', 'error');
            return;
        }

        if (form.password !== form.confirmPassword) {
            toast('Passwords do not match', 'warning');
            return;
        }

        setLoading(true);
        try {
            await register({
                name: form.name,
                email: form.email,
                password: form.password,
                inviteToken: token
            });

            toast('Invitation accepted. Welcome to your organization!', 'success');
            setAccepted(true);
        } catch (error) {
            toast(error.message || 'Failed to accept invitation', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
                <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-sm">
                    <h1 className="text-xl font-bold text-slate-800 mb-2">Invalid Invitation Link</h1>
                    <p className="text-sm text-slate-500 mb-6">
                        This invite link is missing a token. Please open the link from your invitation email.
                    </p>
                    <Link to="/login" className="inline-flex items-center px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium">
                        Go to Login
                    </Link>
                </div>
            </div>
        );
    }

    if (accepted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
                <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-sm">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Invitation Accepted</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
                        Your account is ready. Redirecting you to the dashboard.
                    </p>
                    <p className="text-xs text-slate-400">Redirecting in {redirectIn} second{redirectIn === 1 ? '' : 's'}...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
                <div className="p-8 md:p-12 flex flex-col justify-center order-2 md:order-1">
                    <div className="mb-8 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary text-white font-bold text-xl flex items-center justify-center">N</div>
                            <span className="font-bold text-2xl tracking-tight text-slate-900 dark:text-white">Nano<span className="text-primary">Books</span></span>
                        </div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Join Your Organization</h1>
                        <p className="text-slate-500 dark:text-slate-400">Set up your account to accept the invitation.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                                    <User className="h-5 w-5" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => update('name', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => update('email', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    placeholder="name@company.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={form.password}
                                    onChange={(e) => update('password', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    placeholder="Create a password"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                                    <Lock className="h-5 w-5" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={form.confirmPassword}
                                    onChange={(e) => update('confirmPassword', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                                    placeholder="Confirm password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Accept Invitation'}
                        </button>
                    </form>

                    <div className="mt-8 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-primary hover:text-primary/80">
                            Sign in
                        </Link>
                    </div>
                </div>

                <div className="relative hidden md:block order-1 md:order-2 bg-slate-900 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-blue-600/80 z-10" />
                    <div className="relative z-20 h-full flex flex-col justify-between p-12 text-white">
                        <div className="flex justify-end">
                            <div className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-medium">
                                Team Workspace
                            </div>
                        </div>
                        <div>
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                                <Users className="w-6 h-6" />
                            </div>
                            <h3 className="text-3xl font-bold mb-4 leading-tight">You're one step away from collaborating with your finance team.</h3>
                            <p className="text-white/80 text-sm">Use this secure invitation to access shared accounting data with the right permissions.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
