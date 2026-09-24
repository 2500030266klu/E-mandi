import React, { useState } from 'react';
import { HelpCircle, Search, ChevronDown, ChevronUp, Phone, Mail, FileText, MessageSquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Help = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const { user } = useAuth();

  const generalFaqs = [
    { question: "How do I register on the portal?", answer: "Select your role (Farmer, Trader, Admin, or Management) from the home page and click on 'Register' to begin the process." },
    { question: "What is Kisan-Vyapar e-Portal?", answer: "It is a unified digital platform connecting farmers directly with traders, promoting transparent price discovery and secure transactions." },
    { question: "How can I check the latest MSP?", answer: "The latest Minimum Support Price (MSP) for various crops is available on the Home page under 'Latest MSP Updates'." },
    { question: "Who do I contact if I face technical issues?", answer: "You can reach out to our toll-free support helpline at 1800-180-1551 or email support@kisan-vyapar.gov.in." }
  ];

  const farmerFaqs = [
    { question: "How do I list my produce for sale?", answer: "Log into your Farmer Dashboard, click on 'List Produce', and fill in the details such as crop type, quantity, and your expected price." },
    { question: "How are my payments processed?", answer: "Payments are transferred directly into your registered bank account digitally within 24-48 hours of trade confirmation." },
    { question: "Can I update my land records (Khasra ID)?", answer: "Land records can only be updated by visiting your local district agricultural office with the required physical documents." }
  ];

  const traderFaqs = [
    { question: "How do I participate in an auction?", answer: "From the Trader Dashboard, navigate to 'Active Auctions', view the listed produce, and submit your bids in real-time." },
    { question: "What are the licensing requirements?", answer: "You must have a valid unified trading license issued by the agricultural department to bid across multiple mandis." },
    { question: "Is there a transaction fee?", answer: "A nominal market fee of 1% is applied to successful trades, which is deducted during the settlement process." }
  ];

  const adminFaqs = [
    { question: "How do I approve a new trader license?", answer: "In the District Admin Dashboard, go to 'Pending Approvals', review the submitted documents, and click 'Approve' or 'Reject'." },
    { question: "How to resolve a payment dispute?", answer: "Navigate to the 'Disputes' section, review the trade details from both parties, and follow the standard resolution protocol outlined in the manual." },
    { question: "Can I generate district-wide reports?", answer: "Yes, use the 'Analytics & Reports' module to generate custom reports on trade volume and MSP compliance." }
  ];

  let faqs = generalFaqs;
  if (user?.role === 'farmer') faqs = farmerFaqs;
  if (user?.role === 'trader') faqs = traderFaqs;
  if (user?.role === 'admin' || user?.role === 'district-admin' || user?.role === 'auction-admin') faqs = adminFaqs;

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full">
      {/* Header Section */}
      <div className="bg-emerald-800 text-white rounded-2xl p-8 mb-8 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-700 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <HelpCircle size={48} className="mb-4 text-emerald-200" />
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            {user ? `Welcome to the ${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Help Center` : "How can we help you today?"}
          </h1>
          <p className="text-emerald-100 mb-8 max-w-2xl">Search our knowledge base or browse frequently asked questions below to find the answers you need.</p>
          
          <div className="relative w-full max-w-xl">
            <input 
              type="text" 
              placeholder="Search for answers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white pl-12 pr-4 py-4 rounded-xl text-slate-800 focus:outline-none focus:ring-4 focus:ring-emerald-500/30 shadow-lg text-lg"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={24} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Content - FAQs */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare size={24} className="text-emerald-600" /> 
            Frequently Asked Questions
          </h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <div key={index} className="border-b border-slate-100 last:border-0">
                  <button 
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-semibold text-slate-800 pr-4">{faq.question}</span>
                    {openFaq === index ? (
                      <ChevronUp size={20} className="text-emerald-600 shrink-0" />
                    ) : (
                      <ChevronDown size={20} className="text-slate-400 shrink-0" />
                    )}
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4 text-slate-600 text-sm leading-relaxed bg-slate-50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-slate-500">
                No FAQs found matching your search.
              </div>
            )}
          </div>
        </div>

        {/* Sidebar - Contact & Resources */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Phone size={24} className="text-emerald-600" /> 
            Contact Support
          </h2>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <p className="text-slate-600 text-sm">If you couldn't find what you were looking for, our support team is ready to help.</p>
            
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Phone size={20} className="text-emerald-700" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Toll-Free Helpline</h4>
                <p className="text-slate-500 text-sm mt-1">1. 8303302855</p>
                <p className="text-slate-500 text-sm mt-1">2. 7582976087</p>
                <p className="text-slate-400 text-xs mt-1">We aim to reply within 24 hours.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <Mail size={20} className="text-blue-700" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800">Email Support</h4>
                <p className="text-slate-500 text-sm mt-1">1. adarshk8303@gmail.com</p>
                <p className="text-slate-500 text-sm mt-1">2. pandeyarchit0201@gmail.com</p>
                <p className="text-slate-400 text-xs mt-1">We aim to reply within 24 hours.</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl shadow-sm text-white p-6 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-700 rounded-full blur-2xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
            <div className="relative z-10 flex flex-col items-start gap-4">
              <FileText size={28} className="text-emerald-400" />
              <div>
                <h4 className="font-bold text-lg">User Manuals</h4>
                <p className="text-slate-300 text-sm mt-2 mb-4 leading-relaxed">Download step-by-step guides for navigating the portal for farmers, traders, and admins.</p>
                <a href="/user_manual.pdf" download="Kisan_Vyapar_User_Manual.pdf" className="inline-block text-center text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-4 rounded-lg transition-colors shadow-sm">
                  Download PDF
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
