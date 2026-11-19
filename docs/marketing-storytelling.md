# Unified marketing pages and cartoon storytelling

The company/vendor dashboard reference now applies across all marketing pages: white/sky-blue canvas, black pill buttons, blue accents, rounded cards, segmented controls, forms and neutral footers. Audience pages use the existing dispatcher, vendor and handover illustrations instead of photographic campaign images. The proof/demo sample also uses the cartoon handover; browser-local user-selected photos still work in the interactive proof exercise.

New narrative artwork supports How it works, pricing and the demo page. Existing landing artwork and markup are unchanged. All existing visible marketing copy, navigation links and form hooks are preserved. Operational company/vendor/rider screens and real authentication remain untouched.

## Artwork

Generated with the built-in image-generation tool, using the existing dispatcher/vendor cartoons as style references. The production assets preserve transparency and are optimized as WebP:

- `frontend/public/marketing/assets/delivery-journey.webp` (364,500 bytes): a vendor passes a parcel to the mascot, a dispatcher reviews a clipboard, and a courier hands a parcel to a customer, linked by a blue ribbon.
- `frontend/public/marketing/assets/delivery-planning.webp` (253,100 bytes): a dispatcher and vendor plan together around parcels while the mascot holds a checked receipt.

The original main hero, dispatcher, stock, handover and parcel-character assets remain unchanged.

Prompt foundation: match the established hand-drawn 2D cartoon family, with dark organic outlines, expressive Nigerian people, golden parcels, coral/lilac/cobalt clothing, cream details, subtle texture and the smiling yellow parcel mascot. Full uncropped subjects, transparent background, no lettering, logos, prices or interface mockups.

Journey prompt: show a continuous vendor → dispatcher → courier/customer journey in one connected composition, using the existing cast and a loose sky-blue ribbon. Keep the story coherent and background-free.

Planning prompt: show a small Nigerian logistics team discussing a cream clipboard on a golden parcel table. The lilac-clad dispatcher and coral-shirted vendor smile together; the parcel mascot holds a checked receipt. Add parcels and a looping blue ribbon, with no rider, office setting or lettering. A cleanup edit requested crisp transparency outside the silhouettes while preserving the subjects.

## Verification

- Production frontend build passes.
- `node frontend/scripts/verify-landing-preservation.mjs` verifies all 13 pages retain visible copy, links and form IDs; the homepage markup/artwork and operational app files are unchanged. Shared theme, single headings, anchors and 18 illustration image targets pass.
- `node frontend/scripts/verify-marketing-interactions.mjs` passes real marketing handlers for Ada draft/approval, WhatsApp tabs, sample proof, payment verification, demo brief and homepage interactions.
- All 212 shared-theme rules parse with PostCSS and are scoped to marketing page classes.
- The same theme and images are copied to the private preview, with existing homepage checks passing.
- Browser visual QA remains unavailable because the supported computer-use runtime fails to initialize. DOM tests and build checks are not a substitute for a desktop/mobile visual review.

The open landing-theme pull request is expanded to include these secondary pages. The live operational app is not changed until that pull request is merged.
