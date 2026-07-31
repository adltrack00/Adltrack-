import React from "react"
import { motion } from "framer-motion"
import { ArrowLeft, CircleHelp, Shield, Smartphone, Users, DollarSign, Clock, MessageCircle, ChevronDown, Activity } from "lucide-react"

const C = {
  bg: '#0a1929', card: 'rgba(255,255,255,0.05)', bdr: 'rgba(255,255,255,0.08)',
  h: '#FFFFFF', body: 'rgba(255,255,255,0.55)', muted: 'rgba(255,255,255,0.36)',
  brand: '#FFFC00', brandText: '#000000',
}

const faqData = [
  {
    category: "Getting Started",
    questions: [
      { q: "What is One Permit?", a: "One Permit is a comprehensive care tracking platform that connects families, caregivers, and agencies. It provides real-time health updates, task management, photo verification, and secure messaging to ensure transparent and quality care for your loved ones." },
      { q: "How do I get started?", a: "Simply click 'Get Started' on our homepage and select your role — Family Member, Caregiver, or Agency. You'll be guided through a quick setup process to create your account and start using One Permit within minutes." },
      { q: "Do I need special hardware?", a: "No. One Permit works on any modern smartphone (iOS and Android) or web browser. Caregivers just download the app to get started — no special equipment required." }
    ]
  },
  {
    category: "Security & Privacy",
    questions: [
      { q: "Is One Permit HIPAA Compliant?", a: "Yes, absolutely. We use enterprise-grade encryption and strictly adhere to HIPAA standards to protect all patient health information. Your data is encrypted both in transit and at rest." },
      { q: "Who can see my loved one's health data?", a: "Only authorized family members and caregivers you've approved can view health data. You have full control over who has access, and you can revoke access at any time from your dashboard." },
      { q: "How is photo verification secured?", a: "All photos are encrypted, timestamped, and geotagged for verification purposes. They are stored securely and only accessible to authorized users. Photos cannot be edited or manipulated after upload." }
    ]
  },
  {
    category: "For Families",
    questions: [
      { q: "Can multiple family members join?", a: "Absolutely. The primary account holder can invite unlimited family members to view the care feed. Each family member gets their own login and can participate in the Family Chat." },
      { q: "How do I receive updates about my loved one?", a: "You'll receive real-time notifications for completed tasks, vital sign updates, and messages from caregivers. You can customize notification preferences in your settings." },
      { q: "Can I communicate directly with the caregiver?", a: "Yes! The Family Chat feature allows you to message caregivers directly. You can also initiate video calls to check in on your loved one." }
    ]
  },
  {
    category: "For Caregivers",
    questions: [
      { q: "How does task verification work?", a: "After completing a task, you can mark it complete and optionally add a photo for verification. Photos are automatically timestamped and geotagged to ensure compliance and provide families peace of mind." },
      { q: "What is the AI Copilot?", a: "The AI Copilot is your intelligent care assistant. It provides personalized suggestions, reminds you of patient preferences, alerts you to health concerns, and helps you provide better care." },
      { q: "Can I manage multiple clients?", a: "Yes, you can easily switch between clients using the patient selector. Each client has their own care plan, task list, and communication thread." }
    ]
  },
  {
    category: "For Agencies",
    questions: [
      { q: "What is EVV Compliance?", a: "Electronic Visit Verification (EVV) is a government mandate requiring proof of care delivery. One Permit automatically generates GPS-verified, timestamped, and photo-backed logs that meet all EVV requirements." },
      { q: "How does billing work?", a: "One Permit automatically tracks hours worked and tasks completed. You can generate detailed reports for billing, approve timesheets, and export data to your payroll system." },
      { q: "Can I track multiple caregivers?", a: "Yes, the Agency Dashboard provides real-time visibility into all your caregivers — their locations, active shifts, task completion rates, and compliance scores." }
    ]
  },
  {
    category: "Pricing",
    questions: [
      { q: "How much does it cost?", a: "Families get a 14-day free trial with full access to all features. After that, plans start at $19/month. Agencies have custom tiered pricing based on the number of active clients and caregivers." },
      { q: "Is there a contract?", a: "No long-term contracts required. You can cancel anytime. We offer monthly and annual billing options, with a discount for annual plans." },
      { q: "Do you offer discounts for nonprofits?", a: "Yes! We offer special pricing for nonprofit organizations and community care programs. Contact our sales team for more information." }
    ]
  }
]

const CATEGORY_ICONS = {
  "Getting Started": Activity,
  "Security & Privacy": Shield,
  "For Families": Users,
  "For Caregivers": Smartphone,
  "For Agencies": Clock,
  "Pricing": DollarSign,
}

export const FAQPage = ({ onBack }) => {
  const [openIndex, setOpenIndex] = React.useState(null)

  const toggleQuestion = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`
    setOpenIndex(openIndex === key ? null : key)
  }

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter','Figtree','Manrope',system-ui,sans-serif", letterSpacing: '-0.03em' }}>
      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(10,25,41,0.97)', backdropFilter: 'blur(20px)', borderBottom: `1px solid ${C.bdr}` }}>
        <div style={{ maxWidth: 896, margin: '0 auto', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={onBack}
            style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', border: `1px solid ${C.bdr}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            data-testid="faq-back-btn"
          >
            <ArrowLeft style={{ width: 18, height: 18, color: C.body }} />
          </button>
          <span style={{ fontSize: 17, fontWeight: 700, color: C.h, letterSpacing: '-0.03em' }}>One Permit</span>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '64px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: 896, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,252,0,0.1)', border: '1px solid rgba(255,252,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <CircleHelp style={{ width: 32, height: 32, color: C.brand }} />
            </div>
            <h1 style={{ fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 700, color: C.h, marginBottom: 16, letterSpacing: '-0.03em' }}>
              Frequently Asked Questions
            </h1>
            <p style={{ fontSize: 16, color: C.body, maxWidth: 560, margin: '0 auto', lineHeight: 1.6 }}>
              Find answers to common questions about One Permit. Can't find what you're looking for?{' '}
              <a href="#contact" style={{ color: C.brand, fontWeight: 700, textDecoration: 'none' }}>Contact our support team</a>.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Categories */}
      <section style={{ paddingBottom: 80, padding: '0 20px 80px' }}>
        <div style={{ maxWidth: 896, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
          {faqData.map((category, categoryIndex) => {
            const IconComponent = CATEGORY_ICONS[category.category] || CircleHelp
            return (
              <motion.div
                key={categoryIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: categoryIndex * 0.07 }}
                style={{ background: C.card, border: `1px solid ${C.bdr}`, borderRadius: 20, overflow: 'hidden', backdropFilter: 'blur(8px)' }}
              >
                {/* Category Header */}
                <div style={{ padding: '16px 24px', borderBottom: `1px solid ${C.bdr}`, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,252,0,0.1)', border: '1px solid rgba(255,252,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconComponent style={{ width: 18, height: 18, color: C.brand }} />
                  </div>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: C.h, margin: 0 }}>{category.category}</h2>
                </div>

                {/* Questions */}
                <div>
                  {category.questions.map((item, questionIndex) => {
                    const isOpen = openIndex === `${categoryIndex}-${questionIndex}`
                    return (
                      <div key={questionIndex} style={{ borderBottom: questionIndex < category.questions.length - 1 ? `1px solid ${C.bdr}` : 'none' }}>
                        <button
                          onClick={() => toggleQuestion(categoryIndex, questionIndex)}
                          style={{ width: '100%', padding: '20px 24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', gap: 16 }}
                          data-testid={`faq-question-${categoryIndex}-${questionIndex}`}
                        >
                          <span style={{ fontWeight: 700, color: isOpen ? C.brand : C.h, fontSize: 15, flex: 1, transition: 'color 0.2s', letterSpacing: '-0.03em' }}>
                            {item.q}
                          </span>
                          <ChevronDown style={{ width: 18, height: 18, color: isOpen ? C.brand : C.muted, flexShrink: 0, transition: 'transform 0.25s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                        </button>
                        <motion.div
                          initial={false}
                          animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
                          transition={{ duration: 0.25 }}
                          style={{ overflow: 'hidden' }}
                        >
                          <p style={{ padding: '0 24px 20px', fontSize: 14, color: C.body, lineHeight: 1.7, margin: 0 }}>
                            {item.a}
                          </p>
                        </motion.div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contact" style={{ padding: '64px 20px', background: 'rgba(255,255,255,0.02)', borderTop: `1px solid ${C.bdr}` }}>
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(1.4rem,3vw,1.8rem)', fontWeight: 700, color: C.h, marginBottom: 12, letterSpacing: '-0.03em' }}>Still have questions?</h2>
          <p style={{ fontSize: 15, color: C.body, marginBottom: 32, lineHeight: 1.6 }}>Our support team is here to help. Reach out and we'll get back to you within 24 hours.</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 28px', background: C.brand, color: C.brandText, borderRadius: 50, fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer', letterSpacing: '-0.03em' }}>
              <MessageCircle style={{ width: 18, height: 18 }} />
              Chat with Support
            </button>
            <button style={{ padding: '12px 28px', background: 'transparent', color: C.body, borderRadius: 50, fontWeight: 700, fontSize: 15, border: `1px solid ${C.bdr}`, cursor: 'pointer', letterSpacing: '-0.03em' }}>
              support@onepermit.com
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '28px 20px', borderTop: `1px solid ${C.bdr}` }}>
        <div style={{ maxWidth: 896, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.h, letterSpacing: '-0.03em' }}>One Permit</span>
          <p style={{ fontSize: 12, color: C.muted, margin: 0 }}>© {new Date().getFullYear()} One Permit · Secure care coordination</p>
        </div>
      </footer>
    </div>
  )
}

export default FAQPage
