# ADLTrack - Care Operating System
## Product Requirements Document

### Overview
ADLTrack is a Care Operating System that bridges the gap between caregivers, families, and care agencies with evidence-based care verification.

### Core Value Proposition
- **For Caregivers**: Clarity, protection, and professional capital
- **For Families**: Trust without surveillance ("Peace of Mind")
- **For Institutions**: Auditability, compliance, and structured data

---

## Design System - Dark Theme Implementation (January 2025)

### Design Philosophy
- **Human, welcoming, and story-driven**
- **Dark mode for reduced eye strain and modern aesthetics**
- **Trust-first design that feels personal, not corporate**
- **Every element thoughtfully placed and emotionally reassuring**

### Visual System (Dark Theme)
- **Typography**: Manrope font family (friendly, modern sans-serif)
- **Primary Background**: stone-950 (#0c0a09)
- **Card Background**: stone-900 (#1c1917) with stone-800 borders
- **Text Colors**: 
  - Primary: white
  - Secondary: stone-400
  - Muted: stone-500
- **Accent Colors**: 
  - Emerald (success, active states)
  - Rose (caregiver actions, alerts)
  - Blue (informational)
  - Purple (pain vitals)
  - Orange (heart rate)
- **Corners**: Generous rounding (rounded-2xl, rounded-3xl)
- **Spacing**: 20px (p-5), 24px (p-6) standard padding

### AI-Generated Imagery
- **Patient (David Smith)**: Warm elderly gentleman portrait
- **Caregiver (Julia Martinez)**: Professional, approachable CNA portrait
- **Care Moments**: Medication, meals, walks, vitals imagery
- **Source**: AI-generated via Emergent imaging system

---

## Implemented Features

### ✅ Landing Page (UNCHANGED)
- Hero section with "Simple. Secure." messaging
- Phone mockups showing app interface
- Timeline and feature sections
- Contact form
- Mobile-responsive

### ✅ Caregiver Dashboard (Dark Theme - January 2025)
- **Offline State**: 
  - Dark background (stone-950)
  - Greeting with caregiver profile photo
  - Patient preview card with dark styling
  - Uber-style "GO" button with pulse animation
  - Task count preview
- **Online State**:
  - Patient photo header with gradient overlay
  - Vitals cards (BP, HR, Temp, Pain) - dark cards with colored icons
  - Progress bar (emerald gradient)
  - Minimal tab control (Requests --- Today's Tasks)
  - Task cards with dark styling
  - AI Copilot floating button (emerald gradient)
- **Bottom Navigation**: Dark background with emerald active state
- **Sub-Pages**: All dark themed (Profile, Settings, Support, History, Earnings)

### ✅ Family Dashboard (Dark Theme - January 2025)
- **Home**: 
  - Vitals row with dark cards and colored icons
  - Care Progress bar (emerald gradient)
  - Timeline/Requests tabs
  - Empty state cards with dark styling
- **Menu**: 
  - Profile header with dark background
  - Menu items with dark cards
- **Add Request Modal**: Dark themed with emerald submit button
- **Sub-Pages**: All dark themed (Profile, Caregiver, Settings, Support, History, Billing)

### ✅ Supporting Components (All Dark Themed - January 2025)
- **TaskCard**: Dark cards with proper text contrast
- **TaskRequestCard**: Dark styling with priority badges
- **TaskCompletionModal**: Dark background, dark form inputs
- **VitalsModal**: Dark charts, dark history list, emerald buttons
- **PatientProfileModal**: Dark background with colored accent sections
- **AICopilot**: Emerald gradient button, dark chat interface
- **ChatPage**: Dark message bubbles, dark input field
- **SettingsPage**: Dark toggles with emerald accent
- **ProfilePage**: Dark cards, emerald accent buttons
- **AccountsPage**: Dark transaction list
- **HistoryPage**: Dark shift cards
- **SupportPage**: Dark FAQ list and contact options
- **CaregiverPage**: Dark profile card
- **UpdatesPage**: Dark notifications list

---

## Technical Architecture

### Frontend Stack
- React 19 with JavaScript/JSX
- Tailwind CSS with dark theme tokens
- Manrope font (Google Fonts)
- Lucide React icons
- Recharts for vitals charts (dark styled)
- Framer Motion for animations

### Backend Stack
- FastAPI (Python)
- MongoDB (Motor async driver)
- emergentintegrations for Gemini LLM

---

## Testing Status (January 2025)
- **Dark Theme**: 100% implemented across all components ✅
- **Caregiver Dashboard**: All pages/modals dark themed ✅
- **Family Dashboard**: All pages/modals dark themed ✅
- **Vitals Modal**: Dark charts and forms ✅
- **All Sub-Pages**: Settings, Profile, History, Support, etc. ✅

---

## Prioritized Backlog

### P0 - Critical
- [ ] Connect frontend to real backend APIs
- [ ] Implement user authentication (JWT or Emergent OAuth)
- [ ] Persist task completions to MongoDB
- [ ] Store vital signs readings

### P1 - High Priority
- [ ] Real-time messaging between caregiver and family
- [ ] Push notifications for task reminders
- [ ] Photo evidence upload to cloud storage
- [ ] Incident report submission

### P2 - Medium Priority
- [ ] Enterprise Dashboard with dark theme
- [ ] Shift history analytics
- [ ] Care plan template management
- [ ] Multi-patient support

### P3 - Lower Priority
- [ ] Pattern detection & anomaly alerts
- [ ] Caregiver reputation/rating system
- [ ] Offline-first functionality
- [ ] Export data for compliance audits
- [ ] Fix 34 minor lint errors in LandingPage.jsx, FAQPage.jsx

---

## Data Status
**MOCKED**: All data uses mock data from `/app/frontend/src/services/mockData.js`
- Patient: David Smith (78 years old)
- Caregiver: Julia Martinez (CNA)
- Tasks: 12 daily care tasks
- Proposed Tasks: 2 family requests
- Vitals: 7-day history
