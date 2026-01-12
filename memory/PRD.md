# ADLTrack - Care Operating System
## Product Requirements Document

### Overview
ADLTrack is a Care Operating System that bridges the gap between caregivers, families, and care agencies with evidence-based care verification.

### Core Value Proposition
- **For Caregivers**: Clarity, protection, and professional capital
- **For Families**: Trust without surveillance ("Peace of Mind")
- **For Institutions**: Auditability, compliance, and structured data

---

## Design System (Airbnb-Inspired) - December 2024

### Design Philosophy
- **Human, welcoming, and story-driven**
- **Calm, minimal, and intentionally simple**
- **Trust-first design that feels personal, not corporate**
- **Every element thoughtfully placed and emotionally reassuring**

### Visual System
- **Typography**: Manrope font family (friendly, modern sans-serif)
- **Color Palette**: Stone/neutral tones (stone-50 to stone-900)
- **Accent Colors**: Rose (caregiver actions), Teal (active states), Indigo (AI features), Emerald (success)
- **Shadows**: Soft box-shadows (0_2px_12px_rgba(0,0,0,0.04))
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

### ✅ Caregiver Dashboard (Redesigned)
- **Offline State**: 
  - Greeting with caregiver profile photo
  - Patient preview card with AI-generated image
  - Uber-style "GO" button with pulse animation
  - Task count preview
- **Online State**:
  - Teal gradient header with shift status
  - Patient profile with photo
  - Vitals cards (BP, HR, Temp) with icons
  - Progress bar (tasks completed/total)
  - Segmented tab control (Today's Tasks / Requests)
  - Task cards with priority colors and emoji icons
  - AI Copilot floating button (indigo gradient)
- **Bottom Navigation**: Home, Chat, Shift, Menu (floating with blur)

### ✅ Family Dashboard (Redesigned)
- **Hero Header**: Rose gradient with reassuring message
- **Patient Card**: Profile with AI-generated photo
- **Vitals Row**: Horizontal scroll with 4 vitals (BP, HR, Temp, Pain)
- **Care Progress Card**: Visual task completion status
- **Active Caregiver Card**: Real-time shift info with caregiver photo
- **Care Timeline**: Feed of completed tasks with evidence photos
- **AI Copilot**: Floating button for questions
- **Bottom Navigation**: Activity, Chat, Alerts, Menu

### ✅ Supporting Components
- **TaskCard**: Priority badges with emojis, expandable details
- **TaskRequestCard**: Family request cards with accept/decline
- **TaskCompletionModal**: Photo upload, notes, status selection
- **VitalsModal**: Charts, history, add readings (caregiver)
- **PatientProfileModal**: Medical ID, allergies, contacts, share for EMS
- **AICopilot**: Gemini-powered chat with role-specific personas
- **SignInPage**: Role selection cards

---

## Technical Architecture

### Frontend Stack
- React 19 with JavaScript/JSX
- Tailwind CSS with custom design tokens
- Manrope font (Google Fonts)
- Lucide React icons
- Recharts for vitals charts
- Framer Motion for animations

### Backend Stack
- FastAPI (Python)
- MongoDB (Motor async driver)
- emergentintegrations for Gemini LLM

### AI-Generated Image URLs
```javascript
PATIENT_PROFILE.photo = "emergentagent.com/.../7c7bc024ec1065d47fb0f219e7359a96b1a85d63628823238fca62051d1d2712.png"
CAREGIVER_PROFILE.photo = "emergentagent.com/.../0d5b21a613a79f2e524a35cfa17574e562820a771203c2d63f5294db092f5e94.png"
CARE_IMAGES.medication = "emergentagent.com/.../453bd1aab795a8d4c312f29d43640ac6652d636e5e19337acdc001016a4e77c3.png"
CARE_IMAGES.meal = "emergentagent.com/.../cafa07225118a63f61111220ac6230125b17389a84d7450834c273696c27b3b7.png"
CARE_IMAGES.walk = "emergentagent.com/.../c527b65ae92f45fb0d1b3073f2d9982be28fd338adaa3f25d6f48e6f9a64e813.png"
CARE_IMAGES.vitals = "emergentagent.com/.../1e85b317545e5b7c120268579cc779fadaef5109861b649162128123f74bb2a1.png"
```

---

## Testing Status (Iteration 4)
- **Frontend**: 100% pass rate
- **Landing Page**: Unchanged ✅
- **Caregiver Dashboard**: All flows working ✅
- **Family Dashboard**: All flows working ✅
- **Design Verification**: All Airbnb patterns applied ✅

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
- [ ] Enterprise Dashboard with Airbnb styling
- [ ] Shift history analytics
- [ ] Care plan template management
- [ ] Multi-patient support

### P3 - Lower Priority
- [ ] Pattern detection & anomaly alerts
- [ ] Caregiver reputation/rating system
- [ ] Offline-first functionality
- [ ] Export data for compliance audits

---

## Data Status
**MOCKED**: All data uses mock data from `/app/frontend/src/services/mockData.js`
- Patient: David Smith (78 years old)
- Caregiver: Julia Martinez (CNA)
- Tasks: 12 daily care tasks
- Proposed Tasks: 2 family requests
- Vitals: 7-day history
