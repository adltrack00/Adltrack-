# ADLTrack Mobile App - Product Requirements Document

## Original Problem Statement
Build a mobile app named "ADLTrack" using Expo (React Native) for caregiving coordination with three user roles: Caregiver, Family Member, and Agency. The app should be a high-fidelity, pixel-perfect replica of an existing web application, implemented screen-by-screen based on user-provided screenshots.

## Tech Stack
- **Framework:** Expo (React Native)
- **Styling:** StyleSheet API
- **Navigation:** React Navigation (Stack + Bottom Tabs)
- **State Management:** React useState, useContext (AuthContext, SignOutContext, **SharedDataContext**)
- **Development File:** Single monolithic file `/app/mobile/ADLTrackComplete.js` for Expo Snack testing

## Data Sharing Architecture (NEW)
The app now uses a **SharedDataContext** to connect Caregiver and Family dashboards:

### SharedDataContext provides:
- `sharedTasks` - Tasks completed by caregivers (with photos, notes)
- `sharedRequests` - Requests from family members (with status: pending/accepted/declined)
- `sharedIncidents` - Incident reports from caregivers

### Data Flow:
1. **Caregiver completes a task** → `addCompletedTask()` → Appears in Family's Care Timeline
2. **Family creates a request** → `addFamilyRequest()` → Appears in Caregiver's Requests tab (with badge)
3. **Caregiver accepts/declines request** → `updateRequestStatus()` → Family sees updated status + reason
4. **Caregiver creates incident report** → `addIncidentReport()` → Appears in Family's Incident Reports (with badge)

## User Personas
1. **Caregiver** - Manages shifts, tasks, documentation, vitals tracking
2. **Family Member** - Monitors care, views updates, stays connected
3. **Agency** - Manages staff and compliance (Phase 3)

## Phases

### Phase 1: Auth Flow + Caregiver Dashboard ✅ COMPLETED
- Account type selection screen
- Role-specific sign-up screens
- Universal sign-in screen
- Caregiver Dashboard with:
  - Home screen with patient info, vitals, tasks
  - Task management with completion flow
  - Incident reporting (4-step wizard)
  - Messaging system
  - Shifts management
  - Menu (Profile, Settings, Support)
  - AI Copilot (FAB on Home screen)

### Phase 2: Family Dashboard 🔄 IN PROGRESS
- ✅ Home screen with vitals display
- ✅ Progress tracking section
- ✅ Tabs (My Requests / Care Timeline)
- ✅ **Care Timeline Feed** - COMPLETED
  - Scrollable feed of completed care tasks
  - Task cards with images, titles, completion time, caregiver info
  - Detail modal on tap with full task information
- ✅ **Family Incident Reports** - JUST COMPLETED
  - Red badge on Incident tab showing open incident count (2)
  - Incident Reports List with summary card (Total/Resolved/Open)
  - Recent Incidents list with severity badges (CRITICAL/HIGH)
  - Incident Detail screen with What Happened, Actions Taken sections
  - Evidence Photos grid with zoom icons
  - Full-screen Photo Viewer with navigation arrows and counter
  - Reported By section with verified caregiver info
  - Notification banner about being notified
- ✅ **Family Member Requests** - JUST COMPLETED
  - My Requests tab with red badge count
  - "+ Add New Request" dashed button
  - Empty state with sparkle icon ("No requests yet")
  - New Request Modal with form fields (What do you need?, Additional details, Priority)
  - Priority selector (Standard/High/Urgent) with color states
  - Request cards showing priority badge (HIGH/URGENT/STANDARD)
  - Request status badge (Pending/Accepted/Declined)
  - Decline reason display for declined requests
  - Calendar FAB in bottom-right corner
- ✅ View-only Vitals modals
- ✅ Messages screen
- ✅ Alerts/Notifications screen
- ✅ Menu with Sign Out

### Phase 3: Agency Dashboard ⏳ NOT STARTED
- Placeholder screen exists
- Full implementation pending

## What's Been Implemented (Latest)

### December 2025 - Family Incident Reports Feature
- Added `FAMILY_INCIDENTS` mock data with 2 incidents (Behavioral Change, Fall)
- Created `FamilyIncidentTabIcon` with red notification badge showing open incident count
- Created `FamilyIncidentListScreen` with:
  - Header showing "Incident Reports" title
  - Summary card with Total/Resolved/Open counts  
  - Recent Incidents list with severity badges
- Created `FamilyIncidentDetailScreen` with:
  - Back navigation button
  - Incident icon and title with date/time
  - Severity and Status badges (Critical/High, Open)
  - What Happened section
  - Actions Taken section
  - Evidence Photos grid with tap-to-view functionality
  - Reported By section with verified caregiver
  - Notification banner
- Created `FamilyPhotoViewerModal` with:
  - Full-screen photo display
  - Photo counter (1/7, 2/7, etc.)
  - Left/right navigation arrows
  - Filename and close hint

### December 2025 - Care Timeline Feature
- Added `CARE_TIMELINE_ITEMS` mock data with 6 completed tasks
- Created `CareTimelineCard` component with:
  - Task image with title/time overlay
  - Note section showing caregiver's observation
  - Caregiver info row with avatar
  - Detail button
- Created `CareTimelineDetailModal` with:
  - Caregiver header with avatar and role
  - Task title and completion time
  - Full-size task image
  - Task description section
  - Caregiver verification status
- Updated `FamilyHomeScreen` to:
  - Show timeline feed when "Care Timeline" tab is active
  - Show dynamic progress count (6/12 tasks)
  - Handle tap on timeline cards to open detail modal

## Prioritized Backlog

### P0 - High Priority
- Complete any remaining Family Dashboard features per user feedback
- Begin Phase 3 Agency Dashboard implementation

### P1 - Medium Priority
- Connect AI Copilot to live backend API (`/api/copilot/chat`)
- Integrate AsyncStorage for persistent auth sessions

### P2 - Technical Debt (CRITICAL)
- Refactor monolithic file into proper folder structure:
  - `/src/screens/` - Individual screen components
  - `/src/components/` - Reusable UI components
  - `/src/navigation/` - Navigation configuration
  - `/src/styles/` - Shared style constants
  - `/src/data/` - Mock data and constants

## Known Issues & Patterns

### Recurring Hoisting Errors
Due to single-file architecture, `StyleSheet` objects must be defined BEFORE components that use them. This has caused errors with `incStyles` and `aiStyles` in the past.

### File Size
Current file is ~7,500 lines. Growing larger with each feature.

## Key API Endpoints (Future Integration)
- `/api/copilot/chat` - AI Assistant endpoint

## Testing Method
User tests on real device via Expo Go using Expo Snack. Agent provides complete updated code for copy/paste testing.

## Notes
- All data is currently MOCKED
- Authentication is mocked (any credentials work)
- 3rd party integration planned: Gemini API via Emergent LLM Key
