# ADLTrack - Product Requirements Document

## Original Problem Statement
Build a comprehensive caregiving coordination application named "ADLTrack" with both a React Native mobile app and a React web application. The primary goal is visual and functional parity between the mobile app and the web app for Caregiver and Family dashboards.

## Architecture
```
/app/
├── frontend/ (React Web App - TailwindCSS, Manrope font, dark theme)
│   ├── src/
│   │   ├── components/
│   │   │   ├── CaregiverDashboard.jsx  (5 tabs: Home, Incident, Message, Shifts, Menu)
│   │   │   ├── FamilyDashboard.jsx     (5 tabs: Home, Incident, Message, Alerts, Menu)
│   │   │   ├── PatientProfileModal.jsx (Full medical profile)
│   │   │   ├── VitalsModal.jsx         (Vitals detail view)
│   │   │   ├── AICopilot.jsx           (AI assistant)
│   │   │   ├── TaskCard.jsx            (Task cards)
│   │   │   ├── IncidentReportPage.jsx  (Caregiver incident form)
│   │   │   ├── IncidentViewPage.jsx    (Family incident list)
│   │   │   └── pages/                  (Sub-pages: Profile, Settings, etc.)
│   │   ├── services/mockData.js        (All mock data)
│   │   └── App.js
├── mobile/ (React Native/Expo App)
│   └── ADLTrackComplete.js             (Monolithic mobile app)
├── backend/ (FastAPI)
└── memory/
    └── PRD.md
```

## What's Been Implemented

### Web App (React)
- **Caregiver Dashboard** (fully matches mobile):
  - Home tab: Patient card, vitals grid (colored icons: BP pink, Heart orange, Temp blue, Pain purple), Today's Progress, Requests/Tasks tabs
  - Incident tab: Multi-step incident report form
  - Message tab: Conversation list with chat (via ChatPage)
  - Shifts tab: Clock In/Out, Active Client, Quick Actions, Shift History with filters
  - Menu tab: Colored icon menu items (Medications, Earnings, Shift History, Settings, Support, Sign Out)
  - Medications sub-screen: Summary stats, medication cards with "Mark as Administered"
  - Patient Profile modal: Full medical profile with Care History, Allergies, Medical Conditions, Medications, Code Status, Mobility, Access Instructions, Emergency Contacts, Share Medical ID

- **Family Dashboard** (fully matches mobile):
  - Home tab: Vitals grid (same colored icons), Today's Progress, My Requests/Care Timeline tabs
  - Incident tab: Incident summary + list
  - Message tab: Built-in conversation list + chat view (Family Group, Julia Martinez, Tom Smith)
  - Alerts tab: Upcoming Schedule + Recent Alerts with highlight
  - Menu tab: Mary Smith profile, David Smith patient card, colored icon menu (Care Plan, Weekly Report, Current Caregiver, Billing, Settings, Support, Sign Out)
  - Care Plan sub-screen: Primary Goals, Medications, Daily Schedule, Dietary Restrictions, Emergency Protocol
  - Weekly Report sub-screen: 87% Compliance circle, stats grid, caregiver notes, performance trend bars
  - Current Caregiver sub-screen: Julia Martinez photo, stats (4.9 rating, 5 years, 234 shifts), certifications, contact info

- **Shared Components**: VitalsModal, AICopilot, PatientProfileModal, TaskCard

### Mobile App (React Native/Expo)
- Complete app in ADLTrackComplete.js with role-based auth, Caregiver and Family dashboards

### Mock Data
- All data is mocked in `mockData.js`: patient profile, vitals, tasks, conversations, shift history, alerts, care plan, weekly report, caregiver profile

## Design Language
- **Theme**: Hard dark theme (bg-black, bg-[#1c1c1e] cards)
- **Font**: Manrope (400-800 weights)
- **Primary Color**: #25D366 (green)
- **Vitals Colors**: BP=#ec4899/pink, Heart=#f59e0b/orange, Temp=#3b82f6/blue, Pain=#a855f7/purple
- **Cards**: rounded-2xl, no borders
- **Bottom Nav**: 5 tabs, green active state

## Testing Status
- **Testing Agent**: All 26 tests passed (100% frontend success rate)
- **Date**: March 16, 2026
- **Report**: /app/test_reports/iteration_6.json

## Prioritized Backlog

### P0 - None (current milestone complete)

### P1 - Upcoming
- Redesign Patient Profile on Mobile App (ADLTrackComplete.js)
- Build Agency Dashboard (Web App)
- Connect AI Copilot to backend API (Gemini integration)

### P2 - Future
- AsyncStorage for persistent mobile auth sessions
- Doctor and Caseworker dashboards
- Backend API integration (replace mock data with real API)
- CRITICAL REFACTOR: Break down monolithic ADLTrackComplete.js into modular structure

## Login Credentials (Mock)
- Caregiver: sarah@caregiving.com / password123
- Family: mary@family.com / password123
