# Roadmap

Implementation plan only. The policy and architecture documents hold the ongoing design rules; tasks here deliberately avoid duplicating their detail.

## Phase 0: Project foundation
- [ ] Scaffold Astro + strict TypeScript and Tailwind CSS using **pnpm**; commit `pnpm-lock.yaml` and `packageManager`.
- [ ] Add tokens, responsive layout, icon assets, metadata, and shared footer.
- [ ] Install Pagefind build integration after Astro outputs pages.
- [ ] Configure `pnpm` lint/format/test/build scripts and CI installation.

**Done when:** a minimal homepage builds as static files with correct branding and valid semantic HTML.

## Phase 1: Catalog model and contributor pipeline
- [ ] Implement catalog loader and original/project/request schemas matching `docs/CATALOG.md`.
- [ ] Map YAML to stable routes and relationships; exclude templates/invalid entries.
- [ ] Implement build-time duplicate and referential-integrity validation, including fulfilled-request conflicts.
- [ ] Wire `scripts/validate_catalog.py` into CI; test with valid and invalid fixtures.
- [ ] Finalize `POLICY.md`, PR contribution link, and two GitHub Issue Forms.
- [ ] Verify the single CI review comment workflow accepts Project Requests without links while requiring a repository for Catalog Suggestions.

**Done when:** adding a valid YAML file via PR produces an indexed project and invalid entries fail validation.

## Phase 2: Core browsing experience
- [ ] Home hero/search/Featured/categories/recently-added/**Project Requests**.
- [ ] `/explore` grid/list layout, filters, sort, and empty states.
- [ ] `/software/[slug]`, `/projects/[slug]` and `/requests` views.
- [ ] Responsive navigation, keyboard focus, semantic content, skeleton-free static baseline.

**Done when:** users can reach every published listing via search, original pages, and navigation.

## Phase 3: GitHub metadata
- [ ] Adapt the included batched GraphQL collector to final catalog schema.
- [ ] Schedule a daily trusted metadata refresh; keep previous good values if a repo fetch fails.
- [ ] Integrate cached metadata into cards and detail pages, null-safe.
- [ ] Display “GitHub statistics are refreshed approximately every 24 hours.” plus last-success timestamp.

**Done when:** stats do not require a live browser request and stale/unavailable data never hides a listing.

## Phase 4: Quality and policy
- [ ] Run Lychee on extracted catalog URLs + Markdown for PRs.
- [ ] Run Lychee against generated HTML in the Astro build stage.
- [ ] Weekly full-catalog link audit; determine process for intermittent 403/429 false positives.
- [ ] Render `/disclaimer` from `content/DISCLAIMER.md`; legal review before publication.
- [ ] Confirm footer only links to disclaimer (no contact email text).

**Done when:** navigation and outbound URLs are covered by audits and the disclaimer is discoverable.

## Phase 5: Editorial polish and release readiness
- [ ] Curate real qualifying seed projects; verify factual descriptions.
- [ ] Populate `featured.yaml`, test missing/removed project handling.
- [ ] Add OG/social images, favicon variants, accessibility audit, 320px–wide responsive audit.
- [ ] Optimize fonts/assets, run SEO/sitemap audits, test keyboard command search.
- [ ] Document ongoing PR-review and listing-correction processes.

**Done when:** the site looks polished and its content is accurate, accessible, and properly attributable.

## After MVP (optional)
- [ ] Accessible original-software comparison view.
- [ ] Manually curated collections.
- [ ] Public static JSON export of the catalog.
- [ ] Contributor credits or release RSS feed.
- [ ] Index scale/performance work if metadata batch volume becomes material.
