---
name: UI/UX Redesign – May 2026
description: Full premium dark redesign executed in May 2026, inspired by Subbie app aesthetic
type: project
---

Completed a comprehensive UI/UX redesign of ADLTrack web app (both Caregiver and Family dashboards).

**Why:** User requested Apple/Airbnb/Stripe/Figma-level polish, inspired by Subbie app screenshots. Target: premium dark mode, cinematic feel, ADHD-friendly clarity.

**What changed (web app):**
- `index.css`: Full premium design system — CSS variables for depth layers, brand tokens, glow effects, keyframe animations (fade-up, scale-in, shimmer, float), component primitives (glass-card, btn-brand, input-premium, nav-pill)
- `tailwind.config.js`: Extended with `layer-0..6` depth palette, `brand`, `violet`, `danger`, `ink`, `edge` tokens, premium shadows, gradient utilities, spring/smooth/snappy easing
- `RoleSelectionPage.jsx`: Full rewrite to premium dark with ambient glows, hover-reactive role cards with per-role accent colors
- `AuthPage.jsx`: Full rewrite to premium dark with per-role accent gradients, polished inputs with focus glow, social auth buttons
- `CaregiverDashboard.jsx`: Floating pill bottom nav (blur/glass), premium vitals grid with color-coded icon glows, gradient progress bar, pill-style task tabs, upgraded shift status card with gradient clock button, premium empty states, glass clock alert dialog, refined client list modal, medications sub-screen
- `FamilyDashboard.jsx`: Same floating pill nav, unified vitals grid, gradient progress bar, premium care plan/weekly report sub-screens, caregiver profile page

**Brand evolution:** WhatsApp green (#25D366) → premium teal (#00c896) with gradient (`#00c896 → #00a87a`). Added violet accent (#6f5ef5) and danger (#ff4757).

**How to apply:** When making future UI changes, use the CSS variables (--brand-primary, --layer-3, etc.) and Tailwind tokens (bg-layer-3, text-brand, bg-brand-100, etc.) defined in index.css and tailwind.config.js.
