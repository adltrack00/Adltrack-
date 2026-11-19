# Landing page aligned with company and vendor dashboards

## Reference lock

The user requested a unified front using the existing company and vendor dashboard style, with all landing copy, imagery and content retained. Those two screens are the primary references; the rider screen is excluded from the visual research.

| Existing source | Landing adaptation |
| --- | --- |
| Company.jsx and Vendor.jsx white-to-#aad9fd-to-white band | Identical homepage canvas gradient and 620/700/780px responsive band heights; matching bands in existing handover and parcel scenes |
| ui.jsx Btn ink/blue/white variants | Full pill buttons, black primary gradient, blue action accent, white secondary surface, existing labels and links |
| ui.jsx Card and HeroCard | 28px white FAQ surface and 34px black sample-plan card, matching rings and shadows |
| Stats.jsx StatPill | Existing role links and stock/money control receive segmented white/glass surfaces and white active state |
| ui.jsx Tile | Existing role-demo links receive neutral shortcut surfaces and circular action icons |
| ui.jsx StatusPill | Existing delivered/approval labels use emerald, route labels use blue, informational stock/money tags stay neutral |

`frontend/public/marketing/dashboard-theme.css` is additive and scoped to `.home-page` and `.inner-page`. The marketing build includes it on every public marketing route. Homepage markup, existing artwork and the four original stylesheets remain unchanged. Secondary pages add narrative illustration wrappers and cartoon asset references while preserving visible copy, links and behavior. See `docs/marketing-storytelling.md` for the expanded scope. Company, vendor, rider and authentication code is untouched.

No new copy, sample data, sections or illustrations were added. Image colors, files and placement are preserved.

## Validation

- `node frontend/scripts/verify-landing-preservation.mjs` compares visible copy, links and form hooks on all 13 pages, exact homepage markup, original homepage artwork/style files and operational app screens against the base branch. It passes; text comparisons normalize Git checkout line endings.
- The new CSS parses with PostCSS, and every selector is scoped to marketing page classes.
- Frontend production build passes.
- The private preview uses the same stylesheet, with all 17 page bodies and existing interactions preserved.
- Visual browser QA remains unverified: the supported computer-use runtime fails to initialize with a missing runtime ownership error.
