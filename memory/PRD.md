# ADLTrack - Care Operating System
## Product Requirements Document

### Overview
ADLTrack is a Care Operating System that bridges the gap between caregivers, families, and care agencies with evidence-based care verification.

### Core Value Proposition
- **For Caregivers**: Clarity, protection, and professional capital
- **For Families**: Trust without surveillance ("Peace of Mind")
- **For Institutions**: Auditability, compliance, and structured data

---

## Implemented Features (December 2024)

### ✅ Landing Page
- Hero section with value proposition
- Phone mockups showing app interface
- Timeline section explaining the platform
- Feature sections (Audit-Proof, Family Trust, Billing)
- Contact form
- Mobile-responsive with hamburger menu
- Navigation to Caregiver, Family, and Enterprise dashboards

### ✅ Caregiver Dashboard
- **Shift Management**: Uber-style "GO" button to start/end shifts
- **Patient Profile**: David Smith with photo, medical info, emergency contacts
- **Vitals Display**: BP, HR, Temp cards with glass morphism effect
- **Task Management**:
  - Today's Plan tab with 12 daily tasks
  - Requests tab for family-proposed tasks (accept/decline)
  - Task cards with priority colors (Critical=red, Standard=blue, Quality of Life=green)
  - Task completion modal with photo upload and notes
- **AI Copilot**: Gemini-powered assistant for care guidance
- **Bottom Navigation**: Home, Chats, Shift, Settings
- **Settings Pages**: Profile, Earnings, Shift History, Settings, Support
- **Sign Out Flow**: Returns to role selection

### ✅ Family Dashboard  
- **Vitals Display**: BP, HR, Temp, Pain cards with glass morphism
- **Care Timeline**: Feed of completed tasks with caregiver photos/notes
- **AI Copilot**: Family-specific assistant for care understanding
- **Bottom Navigation**: Activity, Messages, Notifications, Settings
- **Pages**: Profile, Billing, Care History, Caregiver Info, Settings, Support
- **Sign Out Flow**: Returns to role selection

### ✅ Sign-In Page
- Role selection (Caregiver, Family, Enterprise)
- Clean, accessible design

### ✅ Backend API
- FastAPI with MongoDB
- AI Copilot endpoint (/api/copilot/chat)
- Emergent LLM Key integration for Gemini

---

## Technical Architecture

### Frontend Stack
- React 19 with JavaScript/JSX
- Tailwind CSS for styling
- Lucide React for icons
- Recharts for vitals charts
- Framer Motion for animations
- Shadcn/UI components

### Backend Stack
- FastAPI (Python)
- MongoDB (Motor async driver)
- emergentintegrations for LLM

### Key Files
```
/app/frontend/src/
├── App.js                    # Main app with state management
├── types/index.js            # UserRole, TaskStatus, Priority enums
├── services/
│   ├── mockData.js           # Initial tasks, vitals, patient data
│   └── geminiService.js      # AI copilot frontend service
├── components/
│   ├── LandingPage.jsx       # Landing page (DO NOT MODIFY)
│   ├── SignInPage.jsx        # Role selection
│   ├── CaregiverDashboard.jsx # Caregiver main view
│   ├── FamilyDashboard.jsx   # Family main view
│   ├── TaskCard.jsx          # Task display component
│   ├── TaskRequestCard.jsx   # Family request component
│   ├── TaskCompletionModal.jsx # Task completion flow
│   ├── PatientProfileModal.jsx # Patient medical info
│   ├── VitalsModal.jsx       # Vitals charts and input
│   ├── AICopilot.jsx         # AI assistant modal
│   ├── IncidentModal.jsx     # Incident reporting
│   └── pages/                # Sub-pages (Profile, Settings, etc.)

/app/backend/
├── server.py                 # FastAPI server with copilot endpoint
└── .env                      # EMERGENT_LLM_KEY for Gemini
```

---

## Mocked Data (for MVP)
- **Patient**: David Smith (78 years old, Diabetes, Hypertension)
- **Caregiver**: Julia Martinez (CNA, 5 years experience, 4.9 rating)
- **Tasks**: 12 daily care tasks (medications, meals, walks, etc.)
- **Proposed Tasks**: 2 family requests (garden walk, video call)
- **Vitals**: 7-day history for BP, HR, Temp, Pain

---

## Prioritized Backlog

### P0 - Critical (Next Sprint)
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
- [ ] Enterprise Dashboard implementation
- [ ] Shift history analytics
- [ ] Care plan template management
- [ ] Multi-patient support for caregivers

### P3 - Lower Priority
- [ ] Pattern detection & anomaly alerts
- [ ] Caregiver reputation/rating system
- [ ] Offline-first functionality
- [ ] Export data for compliance audits

---

## Testing Status
- Landing Page: ✅ Passed
- Caregiver Dashboard: ✅ Passed (100%)
- Family Dashboard: ✅ Passed (100%)
- AI Copilot: ✅ Working with fallback
- Sign Out Flow: ✅ Passed

---

## Known Issues
- Minor: Emergent badge may overlay bottom navigation (use force click)

---

## Design Guidelines
- Mobile-first approach (430px width primary)
- Inter font family
- Green (#25D366) as primary action color
- Glass morphism for vitals cards
- White/zinc color palette for clean Cal.ai aesthetic
- Bottom navigation for mobile apps
