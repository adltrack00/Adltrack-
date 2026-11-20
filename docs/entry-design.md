# Unified authentication and onboarding

The remaining entry experience now follows the same company/vendor and marketing visual system: white-to-sky-blue canvas with responsive 620/700/780px bands, black pill primary buttons, blue links/focus states, 28px white cards, neutral 16px inputs, and the existing cartoon storytelling artwork. No new images were generated.

## Updated routes and states

- `/signin`: parcel welcome, responsive illustration, matching form card and password/error/busy states.
- `/signup/company`: team-planning scene and the same form controls, retaining the existing company/signup payload.
- `/get-started`: the full vendor/dispatcher/courier scene and neutral role shortcut cards.
- `/join` and `/join/:code`: vendor/courier/parcel artwork matched to the invited role, retaining invite lookup and joining behavior.
- `/setup`: existing steps now use the same cartoon journey, dispatch and planning scenes. Theme choices retain the same IDs/tints and saved setting, presented as cartoon/color previews. Validation, choices, notification permission behavior and completion payload are unchanged.
- Shared app loading, navigation fallback, browser/app splash colors: white/sky canvas and parcel artwork, without the old dark logo loader.
- Private marketing-preview entry gates and the route-error state: matching story frames and existing links to the real app. These gates do not simulate account creation or collect passwords.

All other marketing pages already use the shared theme and cartoon scenes. Operational company/vendor/rider dashboard source, auth API implementation and workspace data layer are unchanged. User-selected operational photos are unaffected.

## Validation

- Ten React tests pass: credentials/errors, password visibility, redirects, signup payload, invitations, role choices, matched desktop/mobile artwork, setup validation and the full setup completion path.
- AST-based preservation check confirms account/invite logic and setup state/actions are unchanged; auth API, workspace and dashboard files match main.
- Existing marketing copy/link/artwork checks and interaction tests pass.
- Production build passes.
- Preview checks preserve copy, navigation and the original homepage while adding entry-story imagery.
- Browser visual verification remains unavailable because the supported computer-use runtime cannot initialize; no desktop/mobile visual pass is claimed.

The private preview can show the marketing entry gates. The real interactive authentication and onboarding changes are in the repository pull request and take effect after that change is merged/deployed.
