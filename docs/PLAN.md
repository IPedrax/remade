# Remade: Product Plan

**Brand:** Remade (`remade.wiki`)  
**Tagline:** Everything can be remade.  
**Purpose:** A beautiful, discoverable, community-curated directory of independently written, faithful software reimplementations.

## 1. Product positioning

Remade is not an open-source-alternatives marketplace, generic rewrite index, package registry, or software host. Its appeal is the relationship between a familiar original program/interface and a separately developed implementation that attempts to reproduce its **observable behavior or compatibility**. Listings should teach visitors what the project targets, what is already compatible, and where to find its code.

**Initial inclusion scope:** reimplementations of original software whose original implementation is not itself open source; see `POLICY.md` for all requirements. The homepage/hero remains neutral about the original software's legal/licensing status. Projects that merely look similar do not qualify.

## 2. Information architecture

| Route | Content |
|---|---|
| `/` | Header, tagline hero, search, prominent Featured area, browse categories, recent entries, footer |
| `/explore` | Searchable directory with category/language/platform/status filters and sortable results |
| `/software/[slug]` | Original software overview, official reference, all indexed reimplementations |
| `/projects/[slug]` | Implementation detail, coverage/limitations, GitHub stats, link to repo |
| `/authors/[github-user]` | Author identity and all attributed indexed projects and tools, including entries not featured |
| `/requests` | Requested reimplementations with no currently indexed matching project |
| `/about` | Remade's story, mission, engineering philosophy, and contribution links |
| `/disclaimer` | Independently developed projects, qualified legal history, contact |
| `/404` | Custom not-found state and search/explore navigation |

**Submit:** link to `CONTRIBUTING.md` for pull requests, plus GitHub Issue Forms for suggesting existing projects or requesting missing reimplementations. No on-site submission forms, user accounts, or runtime backend.

## 3. MVP features

### Home
- Logo/fav icon, brand, nav (Explore, GitHub, Submit).
- Hero heading: **Everything can be remade.**
- Supporting sentence: *Discover independently developed software reimplementations.*
- Accessible site search with `⌘K`/`Ctrl+K` shortcut (enhancement, not a prerequisite).
- **Featured** section immediately after search: one highlighted listing + supporting cards; driven by `src/content/catalog/featured.yaml` and stable editorial order.
- Browse categories; Recently added; **Project Requests**; an unintrusive disclaimer link in footer.

### Catalog and details
- Link an implementation to one or more canonical original software records through the required `originals` array, using one project listing per repository.
- Search originals and implementation names/technical descriptions.
- Project cards: name, concise purpose, original target, primary language, category, optional stars and status.
- Attributed entries, including featured tabs, show **View More by Author** linked to `/authors/[github-user]`. Display GitHub handles; group all indexed entries independently of Featured. Author pages keep tools labeled Tool and support multiple credited authors.
- Detail page: repository/docs, actual stated compatibility scope, known limitations, languages, platforms (if known), license, activity/archived status, GitHub stats.
- Clearly distinguish **claimed** compatibility from verified compatibility; do not invent coverage percentages.
- GitHub stats note: **“GitHub statistics are refreshed approximately every 24 hours.”** Hover/focus displays last successful update from data, if present.
- Sorting: recently added, alphabetic, stars; stars sort nulls last.

### Project Requests
- A separate, static wishlist of specific software/interfaces people want faithfully reimplemented; not a list of existing projects.
- Published source files: `src/content/catalog/requests/<vendor>/<original-slug>.yaml`, added through PR. Community members can also submit an unlisted request proposal using the link-optional GitHub Issue Form.
- Link to the original software page; show target name, category, short reason and contribution CTA.
- Display only requests with **no currently indexed qualifying implementation**; validator rejects a request once a matching implementation exists.
- When accepting the first matching project PR, remove its request entry in that same PR.
- No votes, bounties, promises, or real-time request backend in MVP.

### Contribution/editorial
- One YAML entry per project; submit via PR; maintainer review/merge is publication.
- PR template has a mandatory `POLICY.md` confirmation checkbox; CI tests it. Two separate GitHub Issue Forms are supported: Catalog Suggestion (repository required) and Project Request (no URLs required).
- Maintainers alone edit Featured list. It may include supporting tools, visibly labeled **Tool**; tools are separate from reimplementation counts and never fulfill Project Requests.
- Lychee link checks on PRs, plus full weekly audits; handle rate-limited hosts as triage, not permanent ignores.

## 4. Implementation tooling

Use **Astro + React + strict TypeScript + Tailwind CSS**, with React UI components rendered statically unless explicitly hydrated for interaction. Use **pnpm** exclusively for frontend dependencies and scripts (`pnpm-lock.yaml` must be committed). Keep the site statically generated; build-time GitHub cache ingestion is distinct from content submitted by PR. See `AGENTS.md` for coding rules.

## 5. Explicit non-goals for launch

- No user accounts, dashboards, comments, ratings, votes, or personalized bookmarks.
- No issue-label CMS, runtime database, server APIs, votes, or real-time GitHub statistics.
- No automatically inferred compatibility claims, formal clean-room certification, execution/testing of submitted code, or redistribution of the projects themselves.
- No hosting operations or deployment work included in this bundle.

## 6. Acceptance criteria for initial public release

- Fully static, responsive Astro build with keyboard navigation, good contrast, and no essential JavaScript dependence for basic browsing.
- At least one real reviewed project and an original-software page render from the catalog schema.
- `/requests` and the homepage **Project Requests** section render from validated request files and disappear for fulfilled requests.
- Search/index generated at build time and filter/sort can run locally in the visitor's browser.
- Featured selections remain visible only when their targets exist; no empty filler cards.
- Schema validation rejects bad URLs, missing originals, invalid enums, duplicate slugs or repositories.
- PR policy acknowledgment, validation, and link-check workflows are functioning.
- Daily GitHub stats updater uses GraphQL batching and graceful cache preservation on transient errors.
- Every project page shows stats freshness note and an actual timestamp when available.
- `/disclaimer` exists; footer links to it; email is **only** on `/disclaimer`.
- SEO basics: canonical pages, sitemap, accessible titles/descriptions, social previews; no misleading affiliation.
