import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, Phone, Mail, FileText, ChevronRight, ChevronDown, ExternalLink } from 'lucide-react';

const D = {
  bg: '#F4F8F9', bgAlt: '#eef1f4', card: '#ffffff',
  bdr: 'rgba(0,0,0,0.07)', bdrHv: 'rgba(0,0,0,0.13)',
  h: '#0f172a', body: '#475569', muted: '#94a3b8',
  brand: '#b45309', brandText: '#ffffff',
  brandGrad: 'linear-gradient(135deg,#FFB347,#F28482)',
  shadow: '0 4px 16px -4px rgba(0,0,0,0.08)',
};

const CONTACT_ICON_STYLES = [
  { bg: 'rgba(255,179,71,0.12)', border: 'rgba(255,179,71,0.22)', color: '#b45309' },
  { bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.22)', color: '#1d4ed8' },
  { bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.22)', color: '#7c3aed' },
];

export const SupportPage = ({ onBack, role = 'caregiver' }) => {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const contactOptions = [
    { icon: MessageCircle, label: 'Live Chat',     desc: 'Chat with our support team', action: 'Start Chat' },
    { icon: Phone,         label: 'Call Support',  desc: '1-888-555-0123',             action: 'Call Now'   },
    { icon: Mail,          label: 'Email Support', desc: 'support@adltrack.com',        action: 'Send Email' },
  ];

  const caregiverFaqs = [
    { question: 'How do I complete a task?', answer: "Navigate to the Home tab on your Caregiver Dashboard where you'll see \"Today's Tasks\" listed. Tap on any task to view its details. Once you've performed the activity, tap the \"Mark Complete\" button. You can add a completion note and attach a photo as documentation." },
    { question: 'How do I report an incident?', answer: 'Go to the Incidents tab from the bottom navigation bar. Tap "New Incident Report" to start a 5-step guided report. You\'ll select the incident type, choose a severity level, describe what happened and actions taken, add witness information, optionally attach photos, and review before submitting.' },
    { question: 'How do I update patient vitals?', answer: "From the Home tab, you'll see the vitals summary cards at the top. Tap on any vital card to open the Vitals Modal where you can view the history and trends. To log a new reading, use the input fields provided in the modal." },
    { question: 'How do I contact family members?', answer: 'Use the Messages tab from the bottom navigation bar to access the chat feature. You can send direct messages to family members assigned to the patient.' },
    { question: 'How do I end my shift?', answer: 'Go to the Shifts tab from the bottom navigation bar. You\'ll see your current shift status with a "Clock Out" button. Tap it to end your shift.' },
    { question: 'What is the AI Care Assistant?', answer: "The AI Care Assistant is your intelligent helper available via the floating button on the Home tab. It can answer questions about care protocols, medication schedules, help with documentation, and provide guidance on emergency procedures." },
    { question: 'How do I administer medications?', answer: "From the Menu tab, tap Medications to view all scheduled medications. Tap \"Mark as Administered\" next to each medication when given." },
    { question: 'What should I do in an emergency?', answer: 'In a medical emergency, always call 911 first. Then use the Incidents tab to file an urgent incident report — select "Critical" severity so that family members and the agency are immediately notified.' },
  ];

  const familyFaqs = [
    { question: "How do I monitor my loved one's care?", answer: "Your Home tab provides a real-time overview of your loved one's care. You'll see today's completed tasks with photos and notes from the caregiver, current vital signs, and any recent alerts." },
    { question: 'How do I view incident reports?', answer: "When a caregiver files an incident report, you'll receive a notification in your Alerts tab. Tap on any alert to see the full incident details including the type, severity, description, actions taken, witness information, and any attached photos." },
    { question: 'How do I message the caregiver?', answer: 'Use the Messages tab from the bottom navigation bar to chat directly with the assigned caregiver.' },
    { question: 'How do I read the Weekly Report?', answer: 'Go to the Menu tab and tap "Weekly Report". The report shows overall care compliance, tasks completed vs. scheduled, medication adherence, number of incidents, and a performance trend chart.' },
    { question: 'How do I view the Care Plan?', answer: "From the Menu tab, tap \"Care Plan\" to see your loved one's complete care schedule including all daily ADL tasks, medication timings, therapy sessions, and special instructions." },
    { question: "How do I check my loved one's vitals?", answer: "On the Home tab, you'll see the latest vital readings displayed at the top. Tap on any vital card to open the detailed view with historical trends and charts." },
    { question: 'How do I view caregiver information?', answer: "From the Menu tab, tap \"Current Caregiver\" to see your assigned caregiver's full profile including their photo, qualifications, certifications, experience, and contact details." },
    { question: 'What is the AI Care Assistant?', answer: "The AI Care Assistant is available via the floating button on the Home tab. As a family member, you can ask it questions about your loved one's care routine, medication details, or get summaries of recent care activity." },
  ];

  const faqItems = role === 'family' ? familyFaqs : caregiverFaqs;
  const resources = [{ label: 'User Guide' }, { label: 'Privacy Policy' }, { label: 'Terms of Service' }];
  const toggleFaq = (idx) => setExpandedFaq(expandedFaq === idx ? null : idx);

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter','Figtree','Manrope',system-ui,sans-serif", letterSpacing: '-0.03em', background: D.bg }} data-testid="support-page">
      {/* Header */}
      <div className="flex items-center px-5 pt-4 pb-3" style={{ background: D.card, borderBottom: `1px solid ${D.bdr}` }}>
        <button
          onClick={onBack}
          className="mr-4 p-2 rounded-xl transition-all"
          style={{ background: D.bg, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}
          data-testid="support-back-btn"
        >
          <ArrowLeft className="w-5 h-5" style={{ color: D.h }} />
        </button>
        <h1 className="text-xl font-semibold" style={{ color: D.h }}>Help &amp; Support</h1>
      </div>

      <div className="px-5 pt-5 pb-24 space-y-6 overflow-y-auto">
        {/* Contact Us */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[1.5px] mb-3" style={{ color: D.muted }} data-testid="contact-us-heading">
            CONTACT US
          </p>
          <div className="space-y-3">
            {contactOptions.map((option, idx) => (
              <button
                key={idx}
                className="w-full flex items-center justify-between p-4 rounded-2xl transition-all"
                style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}
                data-testid={`contact-${option.label.toLowerCase().replace(/\s/g, '-')}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ background: CONTACT_ICON_STYLES[idx].bg, border: `1px solid ${CONTACT_ICON_STYLES[idx].border}` }}
                  >
                    <option.icon className="w-5 h-5" style={{ color: CONTACT_ICON_STYLES[idx].color }} />
                  </div>
                  <div className="text-left">
                    <p className="text-[15px] font-semibold" style={{ color: D.h }}>{option.label}</p>
                    <p className="text-[12px] mt-0.5 font-light" style={{ color: D.muted }}>{option.desc}</p>
                  </div>
                </div>
                <span className="text-[14px] font-semibold" style={{ color: D.brand }}>{option.action}</span>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[1.5px] mb-3" style={{ color: D.muted }} data-testid="faq-heading">
            FREQUENTLY ASKED QUESTIONS
          </p>
          <div className="rounded-2xl overflow-hidden" style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}>
            {faqItems.map((faq, idx) => (
              <div key={idx}>
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between px-4 py-4"
                  data-testid={`faq-item-${idx}`}
                >
                  <span className="text-[14px] font-medium text-left flex-1 pr-3" style={{ color: D.h }}>{faq.question}</span>
                  {expandedFaq === idx
                    ? <ChevronDown className="w-5 h-5 flex-shrink-0" style={{ color: D.brand }} />
                    : <ChevronRight className="w-5 h-5 flex-shrink-0" style={{ color: D.muted }} />
                  }
                </button>
                {expandedFaq === idx && (
                  <div className="px-4 pb-4" style={{ borderTop: `1px solid ${D.bdr}` }}>
                    <p className="text-[13px] leading-relaxed pt-3 font-light" style={{ color: D.body }}>{faq.answer}</p>
                  </div>
                )}
                {idx < faqItems.length - 1 && (
                  <div className="mx-4" style={{ borderTop: `1px solid ${D.bdr}` }} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Resources */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[1.5px] mb-3" style={{ color: D.muted }} data-testid="resources-heading">
            RESOURCES
          </p>
          <div className="rounded-2xl overflow-hidden" style={{ background: D.card, border: `1px solid ${D.bdr}`, boxShadow: D.shadow }}>
            {resources.map((resource, idx) => (
              <div key={idx}>
                <button
                  className="w-full flex items-center justify-between px-4 py-4"
                  data-testid={`resource-${resource.label.toLowerCase().replace(/\s/g, '-')}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,179,71,0.10)', border: '1px solid rgba(255,179,71,0.20)' }}>
                      <FileText className="w-4 h-4" style={{ color: D.brand }} />
                    </div>
                    <span className="text-[15px] font-medium" style={{ color: D.h }}>{resource.label}</span>
                  </div>
                  <ExternalLink className="w-4 h-4" style={{ color: D.muted }} />
                </button>
                {idx < resources.length - 1 && <div className="mx-4" style={{ borderTop: `1px solid ${D.bdr}` }} />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupportPage;
