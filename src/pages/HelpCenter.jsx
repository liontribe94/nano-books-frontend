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
    const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL || 'support@nanobooks.com';
    const liveChatEmailSubject = encodeURIComponent(
        import.meta.env.VITE_SUPPORT_LIVECHAT_EMAIL_SUBJECT || 'Live Chat Request'
    );
    const supportEmailSubject = encodeURIComponent(
        import.meta.env.VITE_SUPPORT_EMAIL_SUBJECT || 'Support Request'
    );
    const helpCenterEmailSubject = encodeURIComponent(
        import.meta.env.VITE_SUPPORT_HELPCENTER_EMAIL_SUBJECT || 'Help Center Question'
    );
    const supportEmailBody = encodeURIComponent(
        import.meta.env.VITE_SUPPORT_EMAIL_BODY || 'Hello Support,'
    );
    const encodedSupportEmail = encodeURIComponent(supportEmail);
    const liveChatGmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedSupportEmail}&su=${liveChatEmailSubject}&body=${supportEmailBody}`;
    const supportGmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedSupportEmail}&su=${supportEmailSubject}&body=${supportEmailBody}`;
    const helpCenterGmailLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedSupportEmail}&su=${helpCenterEmailSubject}&body=${supportEmailBody}`;
    const whatsappNumber = (import.meta.env.VITE_SUPPORT_WHATSAPP_NUMBER || '').replace(/[^\d]/g, '');
    const whatsappPrefill = encodeURIComponent(
        import.meta.env.VITE_SUPPORT_WHATSAPP_TEXT || 'Hello NanoBooks support, I need help with my account.'
    );
    const whatsappLink = whatsappNumber
        ? `https://wa.me/${whatsappNumber}?text=${whatsappPrefill}`
        : `https://wa.me/?text=${whatsappPrefill}`;
    const hasWhatsAppNumber = Boolean(whatsappNumber);

    const handleStartChat = () => {
        if (hasWhatsAppNumber) {
            window.open(whatsappLink, '_blank', 'noopener,noreferrer');
            return;
        }
        window.open(liveChatGmailLink, '_blank', 'noopener,noreferrer');
    };

    const categories = [
        { icon: Rocket, title: 'Getting Started', description: 'Create your account, set company details, and access your dashboard.', count: 8 },
        { icon: FileText, title: 'Invoicing & Sales', description: 'Create invoices, apply tax per line item, and track them in Sales.', count: 14 },
        { icon: CreditCard, title: 'Banking & Expenses', description: 'Connect banking providers, review accounts, and manage expenses.', count: 10 },
        { icon: Zap, title: 'Employees & Payroll', description: 'Add staff, update leave status, and process payroll records.', count: 11 },
        { icon: Shield, title: 'Team Access & Roles', description: 'Invite team members, assign roles, and manage organization access.', count: 7 },
        { icon: HelpCircle, title: 'Troubleshooting', description: 'Fix common API, form validation, and mobile layout issues.', count: 13 },
    ];

    const faqs = [
        {
            question: 'How do I connect my bank account?',
            answer: 'Open the Banking page and use the connect flow to link your provider. Once connected, your account and transactions load in the Banking dashboard.'
        },
        {
            question: 'Does my company name appear on invoice preview?',
            answer: 'Yes. Invoice preview shows your signed-in company name from profile or organization data instead of dummy text.'
        },
        {
            question: 'How is payroll calculated?',
            answer: 'Payroll uses employee salary records and your payroll workflow in the Payroll page. You can review totals and submit payroll cycles from there.'
        },
        {
            question: 'What file formats can I export?',
            answer: 'Export actions in the app generate PDF files. Use the Export button on supported pages to download a PDF copy.'
        },
        {
            question: 'How do I add staff who can log into the app?',
            answer: 'Go to Settings, open Team Access, and send invites from Add Staff Access. Invited users can join with their email and assigned role.'
        },
        {
            question: 'Why do I get 400 Bad Request on some actions?',
            answer: 'A 400 error usually means the request has missing required values or unsupported fields. Check the browser console error text and align frontend fields with backend validation.'
        }
    ];

    const filteredFaqs = faqs.filter((faq) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q);
    });

    return (
        <div className="flex flex-col gap-10 pb-16">
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-900 border border-slate-800 p-10 lg:p-16 flex flex-col items-center text-center">
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
                        {['Connect Banking', 'Create Invoice', 'Add Employee', 'Send Invite'].map((tag) => (
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat, i) => (
                    <CategoryCard key={i} {...cat} />
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                            <HelpCircle className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Frequent Questions</h2>
                    </div>
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
                        {filteredFaqs.map((faq, i) => (
                            <FAQItem key={i} {...faq} />
                        ))}
                        {!filteredFaqs.length && (
                            <div className="py-6 text-sm text-slate-500">
                                No matching articles found. Try keywords like "invoice", "employee", "banking", or "invite".
                            </div>
                        )}
                        <button className="w-full mt-6 py-3 text-sm font-bold text-primary hover:underline">
                            View all FAQs
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="bg-gradient-to-br from-primary to-blue-600 rounded-[2rem] p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500"></div>
                        <h3 className="text-xl font-bold mb-2">Need more help?</h3>
                        <p className="text-white/80 text-sm mb-8 leading-relaxed">
                            Our support team helps with invoicing, banking, employees, payroll, and account access issues.
                        </p>

                        <div className="space-y-3">
                            <button
                                onClick={handleStartChat}
                                className="w-full flex items-center justify-center gap-3 py-3.5 bg-white text-primary rounded-xl font-bold hover:bg-slate-50 transition-all shadow-lg"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Start WhatsApp Chat
                            </button>
                            <a
                                href={supportGmailLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-3 py-3.5 bg-primary/20 border border-white/20 text-white rounded-xl font-bold hover:bg-white/10 transition-all"
                            >
                                <Mail className="w-5 h-5" />
                                Send an Email
                            </a>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-8 shadow-sm">
                        <h4 className="font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                            <Users className="w-5 h-5 text-slate-400" />
                            Resources
                        </h4>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                    <Book className="w-5 h-5 text-slate-500" />
                                </div>
                                <div>
                                    <h5 className="text-sm font-bold text-slate-800 dark:text-white">Product Guides</h5>
                                    <p className="text-xs text-slate-500 mt-1">Step-by-step help for each page in the app.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                    <Users className="w-5 h-5 text-slate-500" />
                                </div>
                                <div>
                                    <h5 className="text-sm font-bold text-slate-800 dark:text-white">Team Admin Tips</h5>
                                    <p className="text-xs text-slate-500 mt-1">Learn how to invite staff and manage user roles.</p>
                                </div>
                            </div>
                        </div>
                        <a
                            href={helpCenterGmailLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full mt-8 py-3 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center block"
                        >
                            Contact Support
                        </a>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-10 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
                <p>© 2026 NanoBooks Support. Made for professionals.</p>
                <div className="flex gap-6">
                    <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
                    <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
                    <a href={supportGmailLink} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Contact Us</a>
                </div>
            </div>
        </div>
    );
}

