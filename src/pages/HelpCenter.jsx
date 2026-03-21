import React, { useState } from 'react';
import {
    Search,
    Book,
    MessageCircle,
    Mail,
    Users,
    ChevronRight,
    Plus,
    Minus,
    Rocket,
    CreditCard,
    Shield,
    FileText,
    HelpCircle,
    Zap
} from 'lucide-react';

const CategoryCard = ({ icon, title, description, count }) => (
    <button className="flex flex-col items-start p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all group text-left">
        <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
            {React.createElement(icon, { className: 'w-6 h-6 text-slate-400 group-hover:text-primary transition-colors' })}
        </div>
        <h3 className="font-bold text-slate-800 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-slate-500 mb-3">{description}</p>
        <span className="text-xs font-bold text-primary flex items-center gap-1">
            {count} Articles <ChevronRight className="w-3 h-3" />
        </span>
    </button>
);

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-100 dark:border-slate-800">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-5 text-left group"
            >
                <span className="font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">
                    {question}
                </span>
                {isOpen ? <Minus className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-slate-400" />}
            </button>
            {isOpen && (
                <div className="pb-5 text-sm text-slate-500 leading-relaxed animate-slide-in">
                    {answer}
                </div>
            )}
        </div>
    );
};

export default function HelpCenter() {
    const [searchQuery, setSearchQuery] = useState('');

    const categories = [
        { icon: Rocket, title: 'Getting Started', description: 'Learn the basics of Nano Books and set up your account.', count: 12 },
        { icon: FileText, title: 'Invoicing & Sales', description: 'How to create, send, and manage your invoices.', count: 24 },
        { icon: CreditCard, title: 'Payments & Banking', description: 'Connect your bank accounts and reconcile transactions.', count: 18 },
        { icon: Zap, title: 'Payroll & Employees', description: 'Manage employee profiles and process payroll runs.', count: 15 },
        { icon: Shield, title: 'Security & Privacy', description: 'Configure MFA, permissions and data security.', count: 8 },
        { icon: HelpCircle, title: 'Troubleshooting', description: 'Common issues and how to resolve them quickly.', count: 21 },
    ];

    const faqs = [
        {
            question: "How do I connect my bank account?",
            answer: "Go to the Banking page and click 'Add Bank Account'. You'll be prompted to select your provider via Plaid or use manual import. Once connected, your transactions will sync automatically every 24 hours."
        },
        {
            question: "Can I customize the invoice template?",
            answer: "Yes! In the Invoicing page, click on 'Edit Template Design'. You can upload your logo, change brand colors, and choose from multiple layout options to match your company's identity."
        },
        {
            question: "How is payroll calculated?",
            answer: "Payroll is calculated based on the gross salary, tax rates, and deductions specified in the Employee Profile. Our system automatically updates tax tables to ensure compliance with the latest regulations."
        },
        {
            question: "What file formats can I export?",
            answer: "You can export most reports and tables as CSV, Excel, or PDF. Look for the 'Export' or 'Download' button at the top right of any page."
        }
    ];

    return (
        <div className="flex flex-col gap-10 pb-16">
            {/* ── Hero Search Section ── */}
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 border border-slate-800 p-10 lg:p-16 flex flex-col items-center text-center">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 blur-[100px] -mr-40 -mt-40"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 blur-[80px] -ml-20 -mb-20"></div>

                <div className="relative z-10 max-w-2xl w-full">
                    <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                        How can we <span className="text-primary">help you</span> today?
                    </h1>
                    <p className="text-slate-400 mb-10 text-lg">
                        Search our knowledge base or browse categories below to find answers.
                    </p>
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            placeholder="Search for articles, guides, and more..."
                            className="w-full pl-14 pr-6 py-5 bg-white/5 dark:bg-slate-800/50 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary backdrop-blur-sm transition-all text-lg shadow-2xl"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap justify-center gap-2 mt-6">
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Popular:</span>
                        {['Connecting Bank', 'Invoice Templates', 'Tax Forms', 'Payroll Run'].map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSearchQuery(tag)}
                                className="text-xs text-slate-400 hover:text-white transition-colors border-b border-dotted border-slate-600"
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Help Categories ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat, i) => (
                    <CategoryCard key={i} {...cat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* ── FAQ Section ── */}
                <div className="lg:col-span-2">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <HelpCircle className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Frequent Questions</h2>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                        {faqs.map((faq, i) => (
                            <FAQItem key={i} {...faq} />
                        ))}
                        <button className="w-full mt-6 py-3 text-sm font-bold text-primary hover:underline">
                            View all FAQs
                        </button>
                    </div>
                </div>

                {/* ── Contact Support Sidebar ── */}
                <div className="flex flex-col gap-6">
                    <div className="bg-gradient-to-br from-primary to-blue-600 rounded-[2rem] p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                        <h3 className="text-xl font-bold mb-2">Need more help?</h3>
                        <p className="text-white/80 text-sm mb-8 leading-relaxed">
                            Our support specialists are typically available Mon-Fri, 9am - 6pm EST.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={() => window.open('mailto:support@nanobooks.com?subject=Live%20Chat%20Request', '_blank')}
                                className="w-full flex items-center justify-center gap-3 py-3.5 bg-white text-primary rounded-xl font-bold hover:bg-slate-50 transition-all shadow-lg"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Start Live Chat
                            </button>
                            <button
                                onClick={() => window.open('mailto:support@nanobooks.com?subject=Support%20Request', '_blank')}
                                className="w-full flex items-center justify-center gap-3 py-3.5 bg-primary/20 border border-white/20 text-white rounded-xl font-bold hover:bg-white/10 transition-all"
                            >
                                <Mail className="w-5 h-5" />
                                Send an Email
                            </button>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm">
                        <h4 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <Users className="w-5 h-5 text-slate-400" />
                            Community
                        </h4>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                    <Book className="w-5 h-5 text-slate-500" />
                                </div>
                                <div>
                                    <h5 className="text-sm font-bold text-slate-800 dark:text-white">Developer API</h5>
                                    <p className="text-xs text-slate-500 mt-1">Read our API docs and integrate with ease.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                    <Users className="w-5 h-5 text-slate-500" />
                                </div>
                                <div>
                                    <h5 className="text-sm font-bold text-slate-800 dark:text-white">Nano Forum</h5>
                                    <p className="text-xs text-slate-500 mt-1">Join the conversation with other professionals.</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => window.open('https://github.com', '_blank')}
                            className="w-full mt-8 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Visit Community
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Footer ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-10 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                <p>© 2024 Nano Books Support. Made for professionals.</p>
                <div className="flex gap-6">
                    <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
                    <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
                    <a href="mailto:support@nanobooks.com" className="hover:text-primary transition-colors">Contact Us</a>
                </div>
            </div>
        </div>
    );
}



