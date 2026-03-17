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
│   │   │   ├── VitalsModal.jsx         (Redesigned - unique color themes per vital)
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

- **VitalsModal (Redesigned March 16, 2026)**:
  - Unique color themes per vital type:
    - Blood Pressure: Pink/Maroon (#e91e7a, bg #5c1a3d)
    - Heart Rate: Orange (#f97316, bg #6b3410)
    - Temperature: Blue (#3b82f6, bg #1a3a5c)
    - Pain Level: Purple (#8b5cf6, bg #3d1a5c)
  - Custom SVG charts with dots and connecting lines
  - Themed current reading cards
  - Color-coded history list values
  - "Log New Reading" form (Caregiver only)
  - Weekly trend visualization (Mon-Sun)

- **IncidentReportPage (Redesigned March 16, 2026)**:
  - 5-step multi-step form (expanded from 4 steps):
    - Step 1: Incident Type selection (6 types with icons)
    - Step 2: Severity Level & Description
    - Step 3: Witness Information (NEW - textarea + "No witnesses" checkbox + info box)
    - Step 4: Add Photos (Optional)
    - Step 5: Review & Submit with toggles
  - Dark theme (bg-black) with pink/red progress bar (#ff3b5c)
  - Green checkmark toggles for "Notify Family" and "Follow-up Required"
  - Success modal overlay
  - Past Reports list with severity badges

- **Shared Components**: VitalsModal, AICopilot, PatientProfileModal, TaskCard, IncidentReportPage

### Mobile App (React Native/Expo)
- Complete app in ADLTrackComplete.js with role-based auth, Caregiver and Family dashboards

### Mock Data
- All data is mocked in `mockData.js`: patient profile, vitals, tasks, conversations, shift history, alerts, care plan, weekly report, caregiver profile

## Design Language
- **Theme**: Hard dark theme (bg-black, bg-[#1c1c1e] cards)
- **Font**: Manrope (400-800 weights)
- **Primary Color**: #25D366 (green)
- **Vitals Colors** (unique themes per modal):
  - Blood Pressure: #e91e7a (pink) with #5c1a3d background
  - Heart Rate: #f97316 (orange) with #6b3410 background
  - Temperature: #3b82f6 (blue) with #1a3a5c background
  - Pain Level: #8b5cf6 (purple) with #3d1a5c background
- **Cards**: rounded-2xl to rounded-3xl, no borders
- **Bottom Nav**: 5 tabs, green active state

## Testing Status
- **Testing Agent**: All tests passed (100% frontend success rate)
- **Date**: March 17, 2026
- **Latest Report**: /app/test_reports/iteration_9.json
- **Features Tested**: VitalsModal redesign (iteration_7), IncidentReportPage redesign (iteration_8, iteration_9)

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

## Recent Changes Log
- **March 16, 2026**: Redesigned VitalsModal with unique color themes per vital type (Blood Pressure, Heart Rate, Temperature, Pain Level), custom SVG charts, themed current reading cards, and color-coded history values
- **March 16, 2026**: Redesigned IncidentReportPage with 5-step form (added Witness Information step), dark theme, pink progress bar, green toggle checkmarks, success modal overlay
- **March 17, 2026**: Fixed IncidentReportPage layout - full-screen form view with hidden bottom nav, proper Continue button positioning, exact color matching to mobile screenshots (pink #ff375f, green #30d158, orange severity #ff9f0a)
