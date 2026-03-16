# ADLTrack - Product Requirements Document

## Original Problem Statement
Build a mobile app named "ADLTrack" using Expo (React Native) for caregiving coordination with multiple user roles. The app is a real-time care accountability infrastructure connecting Caregivers, Families, Agencies, and eventually Doctors and Medicaid Caseworkers.

## User Personas
1. **Caregivers** - CNAs and home health aides who provide direct care
2. **Family Members** - Children/relatives who want to monitor loved one's care
3. **Agencies** - Care coordination organizations managing multiple caregivers
4. **Future: Doctors** - Medical professionals overseeing patient care
5. **Future: Caseworkers** - Medicaid case managers

## Core Requirements

### Caregiver App
- Clock in/out with GPS verification
- Client selection/switching
- Log ADL tasks, medication, vitals, and incidents with evidence (photos/video)
- View care plans and daily schedules
- Manage requests from family members
- AI Care Assistant (Copilot)

### Family App
- Real-time care timeline of completed tasks
- View incident reports, vitals trends, and medication logs
- Submit requests to caregivers
- View caregiver performance scores and weekly/daily summaries
- Care Plan visibility

### Shared Data Architecture
- All data (tasks, incidents, requests) shared in real-time via SharedDataContext
- Caregiver and Family apps consume same data source

## Technology Stack
- **Framework:** Expo (React Native)
- **Architecture:** Single-file for Expo Snack testing
- **State Management:** React Context (AuthContext, SignOutContext, SharedDataContext)
- **Navigation:** React Navigation (Bottom Tabs + Stack)
- **Styling:** StyleSheet API

---

## Implementation Status

### Completed (December 2025)
- [x] Full authentication flow (Caregiver, Family, Agency roles)
- [x] Caregiver Dashboard with patient card, vitals grid, tasks, requests
- [x] Family Dashboard with Care Timeline, Incident Reports, My Requests
- [x] SharedDataContext for real-time data sharing
- [x] AI Copilot FAB on both dashboards
- [x] **UI Refactor: Moved Clock In/Out and Client Selector to Shifts tab**
- [x] **UI Refactor: Moved Caregiver Performance + Today's Summary to "Current Caregiver" profile in Family Menu**
- [x] **Created comprehensive Current Caregiver profile with photo, stats, certifications, contact info, and performance metrics**
- [x] **Progress bar fix: Now dynamically calculates based on completed tasks**
- [x] **Incident Report: Updated photo upload UI to match Tasks screen, added Witness step (5 steps total)**
- [x] **WEB APP REBUILD: Ported mobile app Caregiver & Family dashboards to web - exact replica with all features**

### In Progress
- [ ] Wire up Care Plan and Weekly Report screens with data
- [ ] Complete SharedDataContext data flows

### Upcoming (P1)
- [ ] Build Agency Dashboard (Web App)

### Future (P2)
- [ ] Connect AI Copilot to live backend API
- [ ] AsyncStorage for persistent auth sessions
- [ ] Doctor and Caseworker dashboards
- [ ] Epic FHIR API integration
- [ ] **CRITICAL: Break down ADLTrackComplete.js into modular structure**

---

## File Structure
```
/app/
└── mobile/
    └── ADLTrackComplete.js  # Monolithic file (~9580 lines)
└── memory/
    └── PRD.md               # This document
```

## Known Technical Debt
1. **Monolithic File** - ADLTrackComplete.js is ~9580 lines and needs to be broken into:
   - /src/screens/ (separate screen components)
   - /src/components/ (reusable UI components)
   - /src/navigation/ (navigation configuration)
   - /src/context/ (context providers)
   - /src/styles/ (shared styles)

2. **Mock Data** - All authentication and data is currently mocked

## Testing
- Primary testing via **Expo Snack** (user copies code manually)
- No automated test suite yet
