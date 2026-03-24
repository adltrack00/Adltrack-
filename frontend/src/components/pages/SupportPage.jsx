import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, Phone, Mail, FileText, ChevronRight, ChevronDown, ExternalLink } from 'lucide-react';

export const SupportPage = ({ onBack }) => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const contactOptions = [
    { icon: MessageCircle, label: 'Live Chat', desc: 'Chat with our support team', action: 'Start Chat' },
    { icon: Phone, label: 'Call Support', desc: '1-888-555-0123', action: 'Call Now' },
    { icon: Mail, label: 'Email Support', desc: 'support@adltrack.com', action: 'Send Email' },
  ];

  const faqItems = [
    {
      question: 'How do I complete a task?',
      answer: 'Navigate to the Home tab on your Caregiver Dashboard where you\'ll see "Today\'s Tasks" listed. Tap on any task to view its details. Once you\'ve performed the activity (bathing, grooming, meal prep, etc.), tap the "Mark Complete" button. You can add a completion note and attach a photo as documentation. Completed tasks are automatically logged and visible to the family member\'s dashboard.'
    },
    {
      question: 'How do I report an incident?',
      answer: 'Go to the Incidents tab from the bottom navigation bar. Tap "New Incident Report" to start a 5-step guided report. You\'ll select the incident type (Fall, Medication Issue, Behavioral Change, Injury, Vital Sign Concern, or Other), choose a severity level, describe what happened and actions taken, add witness information, optionally attach photos, and review before submitting. Family members are automatically notified when an incident is reported.'
    },
    {
      question: 'How do I update patient vitals?',
      answer: 'From the Home tab, you\'ll see the vitals summary cards at the top (Blood Pressure, Heart Rate, Temperature, Pain Level). Tap on any vital card to open the Vitals Modal where you can view the history and trends. To log a new reading, use the input fields provided in the modal. All vitals are timestamped and tracked over time so family members and doctors can monitor trends.'
    },
    {
      question: 'How do I contact family members?',
      answer: 'Use the Messages tab from the bottom navigation bar to access the chat feature. You can send direct messages to family members assigned to the patient. Messages are delivered in real-time. For urgent matters, you can also use the incident reporting system which automatically notifies family members. The family member\'s contact details are also available in the patient\'s profile.'
    },
    {
      question: 'How do I end my shift?',
      answer: 'Go to the Shifts tab from the bottom navigation bar. You\'ll see your current shift status with a "Clock Out" button. Tap it to end your shift. Your shift duration and all activities performed during the shift are automatically logged. You can also view your complete shift history from the Menu tab under "Shift History", which shows all past shifts with start times, end times, and hours worked.'
    },
    {
      question: 'What is the AI Care Assistant?',
      answer: 'The AI Care Assistant is your intelligent helper available via the floating button on the Home tab. It can answer questions about care protocols, medication schedules, help with documentation, provide guidance on emergency procedures, and offer best-practice recommendations for ADL (Activities of Daily Living) tasks. It\'s designed to support you during your shifts, but remember — it provides care guidance only and does not replace professional medical advice.'
    },
    {
      question: 'How does the Care Plan work?',
      answer: 'The Care Plan is accessible to family members from their Menu tab. It outlines the patient\'s daily care schedule including all ADL tasks, medication timings, meal plans, and therapy sessions. Caregivers follow this plan during their shifts. The plan is set up by the care coordinator and can be updated by authorized family members or agency staff. Task completion is tracked against the care plan for compliance reporting.'
    },
    {
      question: 'How do I view the Weekly Report?',
      answer: 'Family members can access the Weekly Report from the Menu tab. It provides a comprehensive overview of the past week including: overall care compliance percentage, tasks completed vs. total tasks, medication adherence rate, number of incidents, missed tasks, caregiver notes summarizing the week, and a performance trend chart. This helps families stay informed about their loved one\'s care quality.'
    },
  ];

  const resources = [
    { label: 'User Guide' },
    { label: 'Privacy Policy' },
    { label: 'Terms of Service' },
  ];

  const toggleFaq = (idx) => {
    setExpandedFaq(expandedFaq === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-black font-['Manrope',sans-serif]" data-testid="support-page">
      {/* Header */}
      <div className="flex items-center px-5 pt-3 pb-3">
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
                className="w-full flex items-center justify-between p-4 bg-[#1c1c1e] rounded-2xl"
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
          <div className="bg-[#1c1c1e] rounded-2xl overflow-hidden">
            {faqItems.map((faq, idx) => (
              <div key={idx}>
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between px-4 py-4"
                  data-testid={`faq-item-${idx}`}
                >
                  <span className="text-[15px] font-medium text-white text-left flex-1 pr-3">{faq.question}</span>
                  {expandedFaq === idx
                    ? <ChevronDown className="w-5 h-5 text-[#25D366] flex-shrink-0" />
                    : <ChevronRight className="w-5 h-5 text-[#8e8e93] flex-shrink-0" />
                  }
                </button>
                {expandedFaq === idx && (
                  <div className="px-4 pb-4">
                    <p className="text-[#ababab] text-[14px] leading-relaxed">{faq.answer}</p>
                  </div>
                )}
                {idx < faqItems.length - 1 && (
                  <div className="mx-4 border-t border-[#2c2c2e]" />
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
                className="w-full flex items-center justify-between p-4 bg-[#1c1c1e] rounded-2xl"
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
