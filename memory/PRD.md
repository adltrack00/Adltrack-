# ADLTrack Mobile App - Product Requirements Document

## Original Problem Statement
Build a mobile app named "ADLTrack" using Expo (React Native) for caregiving coordination with three user roles: Caregiver, Family Member, and Agency. The app should be a high-fidelity, pixel-perfect replica of an existing web application, implementing the full PRD vision for real-time care accountability.

## Tech Stack
- **Framework:** Expo (React Native)
- **Styling:** StyleSheet API
- **Navigation:** React Navigation (Stack + Bottom Tabs)
- **State Management:** React useState, useContext (AuthContext, SignOutContext, **SharedDataContext**)
- **Development File:** Single monolithic file `/app/mobile/ADLTrackComplete.js` for Expo Snack testing

## Data Sharing Architecture
The app uses **SharedDataContext** to connect Caregiver and Family dashboards with real-time data sharing:

### SharedDataContext provides:
- `sharedTasks` - Tasks completed by caregivers (with photos, notes, GPS)
- `sharedRequests` - Requests from family members (with status tracking)
- `sharedIncidents` - Incident reports from caregivers
- `medicationLogs` - Medication administration records
- `shiftData` - Clock in/out times, GPS location, hours worked
- `performanceMetrics` - Caregiver performance scores
- `carePlan` - Full care plan with goals, medications, schedule
- `clients` - Multiple client support
- `dailySummary` - Daily care summary data
- `weeklyReport` - Weekly compliance reports
- `emergencyAlerts` - Critical alert system

### Data Flow:
1. **Caregiver clocks in** → GPS verified → Family sees arrival time
2. **Caregiver completes task** → Appears in Family's Care Timeline with photos
3. **Family creates request** → Appears in Caregiver's dashboard (with badge)
4. **Caregiver accepts/declines** → Family sees status + reason
5. **Caregiver logs medication** → Updates daily summary + compliance metrics
6. **Caregiver reports incident** → Family gets alert + can view details

## Phases - IMPLEMENTATION STATUS

### Phase 1: Auth Flow + Caregiver Dashboard ✅ COMPLETED
- Account type selection screen (Caregiver/Family/Agency)
- Role-specific sign-up screens
- Universal sign-in screen
- Caregiver Dashboard with:
  - Home screen with patient info, vitals, tasks
  - **Clock In/Clock Out with GPS verification**
  - **Client Selector (Multiple Clients: David Smith, Margaret Johnson, Robert Williams)**
  - Task management with completion flow (photo evidence, notes)
  - **Medication Logging screen** - Full medication schedule, mark as administered
  - Incident reporting (4-step wizard with photos)
  - Family requests display (accept/decline with reasons)
  - Messaging system
  - Shifts management
  - Menu (Profile, Medications, Earnings, Settings, Support)
  - AI Copilot

### Phase 2: Family Dashboard ✅ COMPLETED
- **Caregiver Performance Score Card** - Monthly score, task completion %, on-time rate, family rating
- **Daily Summary Card** - Tasks done, meds given, caregiver arrival time, incidents
- Home screen with vitals display
- Progress tracking section
- Tabs (My Requests / Care Timeline)
- **Care Timeline Feed** - Shows real tasks completed by caregivers
- **My Requests** - Create requests, track status (pending/accepted/declined), see decline reasons
- **Care Plan Screen** (via Menu) - Full care plan, primary goals, medications, daily schedule, restrictions, emergency protocol
- **Weekly Report Screen** (via Menu) - Compliance score, task/med stats, missed tasks, performance trend
- **Incident Reports** - View all incidents reported by caregivers with photos, evidence viewer
- View-only Vitals modals with history charts
- Messages screen
- Alerts/Notifications screen
- Menu (Profile, Care Plan, Weekly Report, Current Caregiver, Settings)
- AI Copilot

### Phase 3: Agency Dashboard ⏳ NOT STARTED
- Placeholder screen exists
- Full implementation pending

## Features Implemented (All Phases A, B, C)

### Phase A - Core Accountability ✅
1. **Clock In/Clock Out** - Shift time tracking with arrival/departure timestamps
2. **GPS Verification** - Location proof for clock in
3. **Medication-Specific Logging** - Separate screen with dosage tracking, compliance
4. **Daily Summary Report** - Aggregated daily care view for family
5. **Caregiver Performance Score** - Visual score display with metrics

### Phase B - Enhanced Tracking ✅
6. **Multiple Clients Support** - 3 clients with risk levels, task counts
7. **Missed Task Tracking** - Overdue task detection
8. **Video/Audio Evidence** - Data structure supports video/audio (UI ready)
9. **Care Plan Visibility** - Full care plan for family viewing

### Phase C - Advanced ✅
10. **Weekly Compliance Reports** - Full weekly summary with trends
11. **Audio Evidence** - Structure in place
12. **Emergency Alert System** - Data structure for critical alerts

## Key Technical Concepts
- **Framework:** Expo (React Native)
- **Styling:** StyleSheet API (with newFeatureStyles for new features)
- **Navigation:** React Navigation (Stack + Bottom Tabs)
- **State Management:** React Context for global state sharing
- **Dependencies:** expo-image-picker for camera/library access

## Testing Method
User tests on real device via Expo Go using Expo Snack. Copy complete code from `/app/mobile/ADLTrackComplete.js`.

## File Size
Current: ~9,600 lines (monolithic file for Expo Snack compatibility)

## Notes
- All data shared between dashboards via SharedDataContext
- No AI/stock images - uses real photos from device camera
- GPS verification ready (simulated coordinates for demo)
