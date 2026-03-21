import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
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
                        <Scale className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">Terms of Service</h1>
                </div>

                <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-6">
                    <p className="font-medium text-slate-800 dark:text-slate-200">Last Updated: October 2023</p>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 mt-8">1. Acceptance of Terms</h2>
                        <p>By accessing or using compiling services, API integrations, and accounting resources software developed by NanoBooks (collectively, the "Services"), you agree to be bound by these Terms of Service. If you do not agree to these Terms, you may not use the Services. NanoBooks reserves the right to amend these Terms at any time without prior written notice, though substantive changes will be broadcast to active subscribers.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 mt-8">2. Software as a Service (SaaS) License</h2>
                        <p>Subject to your continuous compliance with these Terms and payment of applicable Subscription Fees, NanoBooks grants you a limited, non-exclusive, non-transferable, and revocable license to access and use the Services for your internal business operations. You shall not sublicense, resell, or maliciously reverse-engineer the proprietary platform parameters.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 mt-8">3. Subscription and Fees</h2>
                        <p>Certain components of the Services are subject to payment schemas defined in our Pricing Schedule. Subscription plans, including Starter, Pro, and Enterprise tiers, are charged on a monthly or annual cadence. All fees are exclusive of overarching taxes, levies, or duties imposed by taxing authorities. In the event of chargebacks or insufficient funds, NanoBooks maintains the statutory right to suspend your ledger access immediately upon 14 days post-notice.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 mt-8">4. Financial Data and Compliance</h2>
                        <p>NanoBooks provides transactional ledgers, payroll estimators, and invoicing suites. We act as an aggregate software provider and explicitly disclaim all fiduciary responsibilities. We are not a registered public accounting firm, tax advisor, or legal counsel. Outputs from NanoBooks should be verified by a certified professional before submission to any local, state, or federal tax authority.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 mt-8">5. Limitation of Liability</h2>
                        <p>To the maximum extent permitted by applicable law, NanoBooks and its affiliates, directors, or employees shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Services; (ii) any conduct or content of any third party on the Services.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 mt-8">6. Governing Law</h2>
                        <p>These Terms shall be governed and construed in accordance with the laws of the operating jurisdiction, without regard to its conflict of law provisions. Any dispute arising from these terms will be settled in binding arbitration.</p>
                    </section>
                </div>
            </div>
        </div>
    );
}
