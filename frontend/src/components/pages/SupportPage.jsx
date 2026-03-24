import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, Phone, Mail, FileText, ChevronRight, ChevronDown, ExternalLink } from 'lucide-react';

export const SupportPage = ({ onBack, role = 'caregiver' }) => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const contactOptions = [
    { icon: MessageCircle, label: 'Live Chat', desc: 'Chat with our support team', action: 'Start Chat' },
    { icon: Phone, label: 'Call Support', desc: '1-888-555-0123', action: 'Call Now' },
    { icon: Mail, label: 'Email Support', desc: 'support@adltrack.com', action: 'Send Email' },
  ];

  const caregiverFaqs = [
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
      question: 'How do I administer medications?',
      answer: 'From the Home tab, you\'ll see the Medications section listing all scheduled medications with their times and dosages. When it\'s time to give a medication, tap the "Give Medication" button next to it. Confirm the medication name, dosage, and time. Once administered, it\'s marked as complete and logged for family and agency records. Always double-check the patient\'s medication list before administering.'
    },
    {
      question: 'What should I do in an emergency?',
      answer: 'In a medical emergency, always call 911 first. Then use the Incidents tab to file an urgent incident report — select "Critical" severity so that family members and the agency are immediately notified. Document what happened, actions taken, and any witness information. The AI Care Assistant can also provide quick guidance on emergency protocols while you wait for help.'
    },
  ];

  const familyFaqs = [
    {
      question: 'How do I monitor my loved one\'s care?',
      answer: 'Your Home tab provides a real-time overview of your loved one\'s care. You\'ll see today\'s completed tasks with photos and notes from the caregiver, current vital signs, and any recent alerts. For a broader view, check the Weekly Report from the Menu tab which shows overall compliance, task completion rates, and caregiver notes summarizing the week.'
    },
    {
      question: 'How do I view incident reports?',
      answer: 'When a caregiver files an incident report, you\'ll receive a notification in your Alerts tab. Tap on any alert to see the full incident details including the type, severity, description, actions taken, witness information, and any attached photos. You can also view all past incidents from the Alerts tab history.'
    },
    {
      question: 'How do I message the caregiver?',
      answer: 'Use the Messages tab from the bottom navigation bar to chat directly with the assigned caregiver. You can ask questions about your loved one\'s day, request updates, or discuss care needs. Messages are delivered in real-time. For urgent matters, you can also call the caregiver directly from their profile page.'
    },
    {
      question: 'How do I read the Weekly Report?',
      answer: 'Go to the Menu tab and tap "Weekly Report". The report shows: overall care compliance percentage, tasks completed vs. total scheduled, medication adherence rate, number of incidents, missed tasks, detailed caregiver notes, and a performance trend chart. This gives you a comprehensive view of how your loved one\'s care is progressing week over week.'
    },
    {
      question: 'How do I view the Care Plan?',
      answer: 'From the Menu tab, tap "Care Plan" to see your loved one\'s complete care schedule. This includes all daily ADL tasks (bathing, grooming, meals, exercise), medication timings and dosages, therapy sessions, and special instructions. The care plan is managed by the care coordinator and updated as your loved one\'s needs change.'
    },
    {
      question: 'How do I check my loved one\'s vitals?',
      answer: 'On the Home tab, you\'ll see the latest vital readings (Blood Pressure, Heart Rate, Temperature, Pain Level) displayed at the top. Tap on any vital card to open the detailed view with historical trends and charts. Vitals are recorded by the caregiver during their shifts and updated in real-time so you always have the latest information.'
    },
    {
      question: 'How do I view caregiver information?',
      answer: 'From the Menu tab, tap "Current Caregiver" to see your assigned caregiver\'s full profile including their photo, qualifications, certifications, experience, and contact details. You can also see their shift schedule and ratings. If you need to message or call them, you can do so directly from their profile page.'
    },
    {
      question: 'What is the AI Care Assistant?',
      answer: 'The AI Care Assistant is available via the floating button on the Home tab. As a family member, you can ask it questions about your loved one\'s care routine, medication details, what specific vitals mean, or get summaries of recent care activity. It\'s designed to help you stay informed and understand your loved one\'s care better. Note: it provides guidance only and does not replace professional medical advice.'
    },
  ];

  const faqItems = role === 'family' ? familyFaqs : caregiverFaqs;

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
