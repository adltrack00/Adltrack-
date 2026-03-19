import React from 'react';
import { ArrowLeft, MessageCircle, Phone, Mail, FileText, ChevronRight, ExternalLink } from 'lucide-react';

export const SupportPage = ({ onBack }) => {
  const contactOptions = [
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

  const resources = [
    { label: 'User Guide' },
    { label: 'Privacy Policy' },
    { label: 'Terms of Service' },
  ];

  return (
    <div className="min-h-screen bg-black font-['Manrope',sans-serif]" data-testid="support-page">
      {/* Header */}
      <div className="flex items-center px-5 pt-5 pb-4">
        <button onClick={onBack} className="mr-4 p-1" data-testid="support-back-btn">
          <ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-2xl font-bold text-white">Help & Support</h1>
      </div>

      <div className="px-5 pb-24 overflow-y-auto">
        {/* Contact Us */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-[#8e8e93] uppercase tracking-wider mb-3" data-testid="contact-us-heading">CONTACT US</h2>
          <div className="space-y-3">
            {contactOptions.map((option, idx) => (
              <button
                key={idx}
                className="w-full flex items-center justify-between p-4 bg-[#1c1c1e] border border-[#3a3a3c] rounded-2xl"
                data-testid={`contact-${option.label.toLowerCase().replace(/\s/g, '-')}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-[#2c2c2e] rounded-xl flex items-center justify-center">
                    <option.icon className="w-5 h-5 text-[#8e8e93]" />
                  </div>
                  <div className="text-left">
                    <p className="text-[16px] font-medium text-white">{option.label}</p>
                    <p className="text-[13px] text-[#8e8e93] mt-0.5">{option.desc}</p>
                  </div>
                </div>
                <span className="text-[15px] font-semibold text-[#34C759]">{option.action}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Frequently Asked Questions */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-[#8e8e93] uppercase tracking-wider mb-3" data-testid="faq-heading">FREQUENTLY ASKED QUESTIONS</h2>
          <div className="bg-[#1c1c1e] border border-[#3a3a3c] rounded-2xl overflow-hidden">
            {faqItems.map((faq, idx) => (
              <div key={idx}>
                <button
                  className="w-full flex items-center justify-between px-4 py-4"
                  data-testid={`faq-item-${idx}`}
                >
                  <span className="text-[15px] font-medium text-white text-left">{faq}</span>
                  <ChevronRight className="w-5 h-5 text-[#8e8e93] flex-shrink-0 ml-3" />
                </button>
                {idx < faqItems.length - 1 && (
                  <div className="mx-4 border-t border-[#3a3a3c]" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div>
          <h2 className="text-xs font-semibold text-[#8e8e93] uppercase tracking-wider mb-3" data-testid="resources-heading">RESOURCES</h2>
          <div className="space-y-3">
            {resources.map((resource, idx) => (
              <button
                key={idx}
                className="w-full flex items-center justify-between p-4 bg-[#1c1c1e] border border-[#3a3a3c] rounded-2xl"
                data-testid={`resource-${resource.label.toLowerCase().replace(/\s/g, '-')}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-[#2c2c2e] rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[#8e8e93]" />
                  </div>
                  <span className="text-[16px] font-medium text-white">{resource.label}</span>
                </div>
                <ExternalLink className="w-5 h-5 text-[#8e8e93]" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
