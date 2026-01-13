import React from 'react';
import { ArrowLeft, MessageCircle, Phone, Mail, FileText, ChevronRight, ExternalLink } from 'lucide-react';

export const SupportPage = ({ onBack }) => {
  const supportOptions = [
    { icon: MessageCircle, label: 'Live Chat', desc: 'Chat with our support team', action: 'Start Chat' },
    { icon: Phone, label: 'Call Support', desc: '1-888-555-0123', action: 'Call Now' },
    { icon: Mail, label: 'Email Support', desc: 'support@adltrack.com', action: 'Send Email' },
  ];

  const faqItems = [
    'How do I complete a task?',
    'How do I report an incident?',
    'How do I update patient vitals?',
    'How do I contact family members?',
    'How do I end my shift?',
  ];

  return (
    <div className="min-h-screen bg-stone-950">
      {/* Header */}
      <div className="sticky top-0 bg-stone-900 border-b border-stone-800 px-4 py-4 flex items-center gap-3 z-10">
        <button onClick={onBack} className="p-2 hover:bg-stone-800 rounded-full">
          <ArrowLeft className="w-5 h-5 text-stone-300" />
        </button>
        <h1 className="text-lg font-semibold text-white">Help & Support</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Contact Options */}
        <div>
          <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-3">Contact Us</h2>
          <div className="space-y-3">
            {supportOptions.map((option, idx) => (
              <button
                key={idx}
                className="w-full flex items-center justify-between p-4 bg-stone-900 border border-stone-800 rounded-xl hover:bg-stone-800 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-stone-800 rounded-full flex items-center justify-center">
                    <option.icon className="w-5 h-5 text-stone-300" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-white">{option.label}</p>
                    <p className="text-xs text-stone-400">{option.desc}</p>
                  </div>
                </div>
                <span className="text-sm font-medium text-emerald-400">{option.action}</span>
              </button>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div>
          <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-3">Frequently Asked Questions</h2>
          <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
            {faqItems.map((faq, idx) => (
              <button
                key={idx}
                className="w-full flex items-center justify-between p-4 border-b border-stone-800 last:border-0 hover:bg-stone-800 transition-colors"
              >
                <span className="text-sm font-medium text-white text-left">{faq}</span>
                <ChevronRight className="w-5 h-5 text-stone-600" />
              </button>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div>
          <h2 className="text-sm font-semibold text-stone-400 uppercase tracking-wider mb-3">Resources</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-4 bg-stone-900 border border-stone-800 rounded-xl hover:bg-stone-800 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-stone-400" />
                <span className="font-medium text-white">User Guide</span>
              </div>
              <ExternalLink className="w-4 h-4 text-stone-600" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-stone-900 border border-stone-800 rounded-xl hover:bg-stone-800 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-stone-400" />
                <span className="font-medium text-white">Privacy Policy</span>
              </div>
              <ExternalLink className="w-4 h-4 text-stone-600" />
            </button>
            <button className="w-full flex items-center justify-between p-4 bg-stone-900 border border-stone-800 rounded-xl hover:bg-stone-800 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-stone-400" />
                <span className="font-medium text-white">Terms of Service</span>
              </div>
              <ExternalLink className="w-4 h-4 text-stone-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
