# ADLTrack - Product Requirements Document

## Overview
ADLTrack is a caregiving coordination platform that connects caregivers, families, and agencies. It provides a beautiful, human-centered interface for managing care tasks, tracking vitals, documenting incidents, and communicating between all parties involved in patient care.

## Original Problem Statement
Build a comprehensive caregiving dashboard application with:
- Separate views for Caregivers, Family Members, and Agencies
- Real-time task management and care documentation
- AI-powered copilot for assistance
- Incident reporting system
- Vitals tracking and care history

## Target Users
1. **Caregivers**: Professional caregivers who need to manage shifts, complete tasks, document care activities
2. **Family Members**: Family guardians who want visibility into their loved one's care
3. **Agencies**: Healthcare agencies managing multiple caregivers and patients

## Core Features

### Authentication (MOCK)
- Mock sign-in/sign-up flow that simulates real authentication
- Role selection (Caregiver, Family, Agency)
- Direct navigation to dashboards without real authentication

### Caregiver Dashboard
- Start/End shift functionality
- Patient overview with vitals display (BP, Heart Rate, Temp, Pain)
- Task management (Today's tasks, Requests from family)
- Task completion with photo evidence and notes
- **Incident Reporting** - Now as a dedicated tab in bottom navigation
- AI Copilot for care guidance
- Profile and settings management

### Family Dashboard
- Care timeline with photos and notes from caregiver
- Vitals monitoring
- Request system for asking caregiver to do tasks
- Incident viewing (see reports from caregiver)
- Patient profile access

### Agency Dashboard (Enterprise)
- Multi-patient overview
- Staff management
- Compliance tracking

### Bottom Navigation Structure
**Caregiver**: Home | Incident | Message | Shifts | Menu
**Family**: Home | Incident | Message | Alerts | Menu

**Tab Styling:**
- Active tab: GREEN (#25D366) for all tabs except Incident
- Active Incident tab: RED/ROSE (#f43f5e)
- Inactive tabs: Gray/muted color
- Incident tab on Family dashboard shows notification badge with count

### Design System
- Primary color: #25D366 (Green)
- Accent color for incidents: Rose/Pink (#f43f5e)
- Dark/Light mode support
- Font: Manrope
- Rounded corners: 2xl/3xl for cards
- Tailwind CSS + Shadcn/UI components

## Technical Stack
- **Frontend**: React, Tailwind CSS, Shadcn/UI, Lucide Icons, Framer Motion
- **Backend**: FastAPI (Python)
- **Database**: MongoDB (planned, currently mock data)
- **AI Integration**: Gemini via emergentintegrations

## What's Been Implemented (As of Jan 2026)

### Completed Features
- ✅ Landing page with marketing content
- ✅ Role selection and mock authentication flow
- ✅ Caregiver Dashboard with full task management
- ✅ Family Dashboard with care timeline
- ✅ Dark/Light mode theming (ThemeContext)
- ✅ Vitals display and tracking UI
- ✅ Patient profile modal with care history calendar
- ✅ AI Copilot chat interface (connected to Gemini backend)
- ✅ Task completion with photo evidence
- ✅ **Incident Reporting as Bottom Navigation Tab** (Jan 20, 2026)
  - Moved from floating action button to dedicated nav tab
  - New IncidentReportPage component with history view
  - Multi-step incident creation form
  - Past incidents display with expandable details
  - Rose/pink accent color for incident tab

### Backend Endpoints
- `POST /api/copilot/chat` - AI copilot (working)
- `GET /health` - Health check endpoint
- Auth and data endpoints exist but not connected to frontend

## Pending/Future Work

### P0 - High Priority
- [ ] Backend Implementation & MongoDB Integration
- [ ] Connect frontend to real API endpoints
- [ ] Real authentication (JWT + Google OAuth)

### P1 - Medium Priority
- [ ] Settings page refactor (profile card clickable)
- [ ] Dead code cleanup (RoleSwitcher.jsx, AuthCallback.jsx)
- [ ] ESLint cleanup

### P2 - Low Priority / Future
- [ ] Real-time notifications for family
- [ ] Advanced AI features (contextual chat)
- [ ] Caregiver reputation scoring
- [ ] Pattern detection in care data

## Known Issues
- Application runs on mock data (mockData.js)
- Authentication is simulated, not real
- Some lint warnings present

## File Structure Reference
```
/app/frontend/src/
├── components/
│   ├── CaregiverDashboard.jsx    # Main caregiver view
│   ├── FamilyDashboard.jsx       # Main family view
│   ├── IncidentReportPage.jsx    # NEW - Incident tab content
│   ├── IncidentReportModal.jsx   # Legacy modal (can be removed)
│   ├── IncidentViewModal.jsx     # Family incident viewing
│   ├── AICopilot.jsx             # Chat interface
│   ├── PatientProfileModal.jsx   # Patient details + calendar
│   └── ...
├── context/
│   ├── ThemeContext.jsx          # Dark/Light mode
│   └── AuthContext.jsx           # Mock auth state
├── services/
│   └── mockData.js               # All mock data
└── App.js                        # Main routing
```
