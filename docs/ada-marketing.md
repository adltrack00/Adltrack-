# Ada marketing and authentication integration

The approved Ada website lives in `frontend/public/marketing`. Its original hero, parcel ending, four stylesheets and optimized illustrations are retained, with asset URLs moved under `/marketing/`. Branding is plain text; no graphic logo is rendered. Marketing sign-in, signup and invitation links use this application's own origin.

`yarn build` regenerates 13 public marketing documents before building the React app. FastAPI selects only the explicit public routes in `backend/marketing.py`. Authentication and dashboard routes retain the React shell and existing session-cookie APIs. The frontend development server uses a document bridge for marketing pages; production uses the existing Docker/FastAPI host so the public pages keep their clean URLs.

Sign-in, company signup, role selection and joining share a responsive cream-and-green shell with the original parcel character. Existing fields, API payloads, role destinations and invitation logic remain. Password visibility, busy/error states and autocomplete are retained. Sign-in destinations are restricted to internal app routes. `Intake.jsx` imports are explicit to avoid its collision with `intake.js` on Windows.

The service worker caches the marketing landing document separately from the app shell and refreshes unversioned marketing assets online. Marketing navigation cannot replace the offline dashboard fallback.

## Verification

- Production frontend build passed.
- Seven React form tests passed: credentials, errors, password visibility, internal redirects, signup, invitations and role choices.
- `backend/tests/test_marketing.py` passed: 13 public routes, 11 app/auth routes, static assets, API boundary and path allowlist.
- `backend/tests/test_auth_entrypoints.py` passed: real signup with email/phone-only, cookie sessions, invalid passwords, signout, vendor/rider invitations and sign-in.
- Existing `backend/tests/test_intake.py` passed.
- Source comparison verified the approved hero and parcel ending, stylesheet contents and hero/mascot binaries. Built pages passed a 399-target link/asset audit.
- Browser visual review could not run: the computer-use runtime exits before initialization. Desktop/mobile visual appearance is therefore not claimed as verified.

The broader existing `backend/tests/test_api.py` reaches signup/join successfully, then fails at its workspace authorization assertion: it expects 403 but receives a stale-revision 409. No workspace business logic or auth API implementation was changed for this update.

## Product boundary

The marketing demo still uses local sample data. The demo-request page prepares a downloadable brief; no booking endpoint or business inbox has been configured. Real signup, sign-in and company invitations run through the existing app. Production should continue to use the repository's Docker/FastAPI deployment; serving the React build with an SPA-only static server bypasses the public-route selector.

The focused service-worker test also passes: offline public/app separation, marketing asset fallback, API exclusion and navigation cache keys. Run `node frontend/scripts/test-service-worker.mjs`.
