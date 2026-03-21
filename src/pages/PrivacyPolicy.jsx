import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export default function PrivacyPolicy() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-20">
            <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors hidden sm:flex">
                        <ArrowLeft className="w-5 h-5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300" />
                    </button>
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg">N</div>
                        <span className="font-bold text-xl tracking-tight">Nano<span className="text-primary">Books</span></span>
                    </div>
                </div>
            </nav>

            <div className="pt-32 px-6 max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-primary/10 text-primary flex items-center justify-center rounded-xl">
                        <Shield className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-6">
                    <p className="font-medium text-slate-800 dark:text-slate-200">Last Updated: October 2023</p>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 mt-8">1. Introduction</h2>
                        <p>Welcome to NanoBooks. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website (regardless of where you visit it from) and tell you about your privacy rights and how the law protects you.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 mt-8">2. Data We Collect</h2>
                        <p>As a business management and accounting platform, we collect, use, store and transfer different kinds of personal data which we have grouped together as follows:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                            <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                            <li><strong>Financial Data:</strong> includes bank account and payment card details, and transaction histories securely linked via our third-party aggregators (e.g., Mono, Plaid).</li>
                            <li><strong>Transaction Data:</strong> details about your business expenses, payroll, and inventory records.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 mt-8">3. How We Use Your Data</h2>
                        <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>To register you as a new customer and manage your NanoBooks account.</li>
                            <li>To process and deliver your requested services, including invoicing, payroll processing, and financial reconciliation.</li>
                            <li>To manage our relationship with you, including notifying you about changes to our terms or privacy policy.</li>
                            <li>To use data analytics to improve our software, products/services, marketing, customer relationships, and experiences.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 mt-8">4. Data Security</h2>
                        <p>We have put in place appropriate, bank-grade security measures to prevent your personal data from being accidentally lost, used, or accessed in an unauthorized way, altered, or disclosed. In addition, we limit access to your personal data to those employees, agents, contractors, and other third parties who have a business need to know. They will only process your personal data on our instructions and they are subject to a duty of confidentiality.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 mt-8">5. Third-Party Service Providers</h2>
                        <p>We may share your personal data with internal and external third parties, such as payment processors (Stripe), banking aggregators (Mono), and cloud infrastructure providers (AWS). We require all third parties to respect the security of your personal data and to treat it in accordance with the law.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 mt-8">6. Your Legal Rights</h2>
                        <p>Under certain circumstances, you have rights under data protection laws in relation to your personal data, including the right to request access, correction, erasure, restriction, transfer, to object to processing, to portability of data, and (where the lawful ground of processing is consent) to withdraw consent.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 mt-8">7. Contact Us</h2>
                        <p>If you have any questions about this privacy policy or our privacy practices, please contact our Data Protection Officer at <strong>legal@nanobooks.inc</strong>.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
