# Refined Directory review candidate

This draft implements experiment 01 from the locally supplied Remade redesign lab. It is a design comparison candidate, not a completed production submission service. The owner requested a PR after initially requesting local-only work. No merge, Worker deployment, migration, live issue creation or Discord action is part of this change.

## Baseline

- Source baseline: `62b1bb7c02ff209eb0adb631234ce5f88d6c30e5`, clean `main`.
- Working copy: `/tmp/remade-ux-refined`, branch `ux/refined-directory`.
- Local preview: `http://127.0.0.1:4321/`.
- Existing frontend: `apps/frontend/remade-wiki`; Astro 7, React 19, Tailwind 4, Open Sans Variable, pnpm 12.10.1. No dependency or font changes.
- Existing authentication: `lib/auth.ts`, `stores/auth-store.ts`, `components/auth/`; credentialed Worker session, UUIDv7 identities, login-hint-based account resolution. Production OAuth/session behavior is retained.
- Existing participation: `lib/request-activity.ts`, `stores/request-activity-store.ts`, request activity provider and engagement controls. Production vote and builder endpoints are retained. Local development simulates them in session storage and labels the entire preview accordingly.
- Publication remains reviewed Git-managed catalog PRs. No changes to eligibility, canonical project/software slugs, request fulfillment, featured selections or the submission reviewer.
- `discord_server` and `discord_thread` occur on EarthCraft, SolidCraft, LedgerCraft and Lemon Studio. All source values remain unchanged; details show thread first and server second with their existing logo and outbound-link behavior.
- Canonicals, sitemap, JSON exports, badge sharing, favicon/brand assets, disclaimer and legal contact placement are preserved.

The package's assumption that optional intake fields already match every current GitHub Issue Form is not treated as a policy change. The local prototype accepts name plus acknowledgment, with optional context. Production retains the existing GitHub form, whose current requirements continue to apply. Backend validation and intake-policy alignment need review before activating website submission.

## What changed

Home now leads with a short explanation, Request a project, Explore projects and labeled combined search. Three equal-weight Featured cards retain the existing editorial order; View all featured includes every selection. Six requests appear before categories and recent projects. Data and Catalog Suggestion links have their own quieter section.

One typed directory projection and one shared browse component replace the separate Explore/Requests page implementations. A smaller search projection serves home and duplicate discovery. Cards distinguish projects, tools and requests, retain stage/language and suite links, expose existing Discord links, and use normal independent anchors. Descriptions are previews only; full curated descriptions remain on details. No catalog schema migration is needed.

Browse pages prerender 24 entries and real pagination links. Page 2 and subsequent pages have distinct static content, canonical URLs and sitemap entries. Category and sort stay visible on wide screens; a native modal filter dialog handles the advanced controls and phone layout. Cancel discards edits, Show results applies, Escape closes, focus returns, and the background cannot scroll. Search/filter values stay in the URL; empty results offer a prefilled request route. Existing request sorting and project filter helpers are reused.

Request-only software pages lead with the wish, scope and existing support controls rather than an empty implementation count. Project details gain a nearby Community block. Existing badge sharing, related implementations and supporting tools remain available.

## On-site form boundary

`/requests/new/` is noindex and excluded from the sitemap. Under `pnpm dev`, it hosts the visibly labeled local simulation. In a production build it offers the actual external GitHub Project Request form. The mock form, mock accounts, receipt simulation and local controls are not emitted in production output.

The local form supports drafting before login, alias-aware duplicate suggestions, optional context/category/reference, policy acknowledgment, a public-content notice, and an explicit final submit. Versioned session-storage drafts expire after 24 hours. A changed policy version clears consent. Blocked storage shows a copyable draft before leaving. No tokens or production identities are stored in drafts.

Simulated login preserves the same-tab draft on success, cancellation, expiry and account changes. Simulated delivery distinguishes delivered, uncertain, processing, rate-limited, expired-session and unavailable states. An uncertain receipt locks another submit, survives reload, and offers explicit Check status without polling. A confirmed simulated delivery clears optional draft contents while retaining the receipt and software name. Preview success explicitly says no GitHub Issue was created.

A real verified-session submission client, scoped GitHub App dispatch, private receipt ownership checks, idempotency/reconciliation service and production setup remain outside this UI comparison. No new backend or authentication framework has been added.

## Verification

- Installed the existing lockfile using `pnpm install --offline --frozen-lockfile`; no dependencies changed.
- `pnpm check`: zero errors, warnings or hints.
- `pnpm build`: static build and Pagefind succeeded.
- Biome on changed source and tests: passed.
- Manual Playwright browser walkthroughs used external-host interception: 15 primary checks and 13 extended checks passed; no external requests or page errors were recorded in the successful primary pass.
- Reflow verified at 320, 360, 390, 430, 768, 1024 and 1440 CSS pixels for home, Explore, Requests, the form, a project detail and a request detail.
- Checked typed project/request search, empty-state prefill, filter apply/cancel/Escape/focus restoration, Back/query restoration, existing Discord hrefs, request-only framing, validation, duplicate suggestions, draft/login recovery, uncertain receipt reload/reconciliation, storage failure and no-JavaScript pagination.
- Added unit coverage for classification/aliases, filters/pagination, Discord preservation, Unicode names, optional fields, safe URL validation, draft expiry/policy changes, uncertain intent restoration and storage failures. Updated affected component/E2E expectations and added static pagination/fallback checks.
- Automated test suites are left to CI under repository instructions. The browser walkthrough is interaction evidence, not a claim that all test suites passed.
- Initial browser checks exposed an 18px overflow at 360px and stale Vite optimized modules after concurrent dev/build activity. Both were corrected and the full interaction walkthrough repeated successfully. Final checks/builds run with the dev server stopped.

Preservation checks compare generated route inventories and SHA-256 hashes from the baseline: no existing HTML route disappeared; existing public/brand files and Discord fields are unchanged. Twelve routes were added: the intake page and eleven pagination pages. Public JSON contract code and source catalog files are unchanged. Production output was scanned for preview success text, mock usernames and local controls, with no matches.

Baseline home made a batched request-activity GET and no anonymous auth lookup. The redesigned anonymous home makes no Worker/API request. The request list retains the existing batched activity read in production; local simulation uses only the static request dataset and session storage. No per-card API probes, Discord embeds, analytics or remote search were added.

## Screenshots

The screenshots use the real baseline catalog. Form text and account names are explicitly simulated.

- [Desktop home](screenshots/home-desktop.png)
- [Phone home](screenshots/home-phone.png)
- [Phone filters](screenshots/filters-phone.png)
- [Project detail and Community](screenshots/project-community-phone.png)
- [Request detail](screenshots/request-detail-phone.png)
- [Anonymous draft](screenshots/form-draft-phone.png)
- [Validation errors](screenshots/form-errors-phone.png)
- [Restored signed-in draft](screenshots/form-restored-phone.png)
- [Delivered receipt](screenshots/form-delivered-phone.png)
- [Uncertain delivery](screenshots/form-uncertain-desktop.png)

Detailed local logs, route/asset inventories and the wider screenshot set are kept outside the deployed application at `/tmp/remade-refined-evidence/`.

## Remaining review and release work

This is the first candidate, not a usability-test winner or accessibility certification. Real iOS/Android devices, screen-reader pairings, physical keyboard overlays, 200%/400% browser zoom and field performance have not been verified. No LCP/INP/CLS or cold/warm transfer delta is claimed. The compact projection should still receive a measured bundle/transfer review before release.

Real GitHub OAuth return-to-form integration, live issue dispatch, production receipt authorization and review-parser integration are unverified and intentionally not invoked. The development adapter must not be confused with production behavior. Production resources and deployment settings are unchanged. The owner should review the direction and those integration boundaries before any merge.
