# Remade: UI and Brand Specification

## Tone

A modern reference library for developers: precise, understated, inviting. Inspired by the clarity and category-led discovery of privacytools.io, but **not** a visual copy. Avoid SaaS dashboard chrome, heavy gradients, artificial popularity claims, and over-designed cards.

## Identity

- Wordmark text: `remade.wiki` (prominent *remade*, lime `.wiki` accent permitted).
- Hero: **Everything can be remade.**
- Supporting copy: *Discover independently developed software reimplementations.*
- Icon: two overlapping squares; outline = first implementation, solid = second; small charcoal void at intersection.
- Favicons: `public/favicon.svg`, `public/favicon-16.png`, `public/favicon-32.png`, `public/apple-touch-icon.png`; a 512px visual reference at `assets/branding/favicon-preview.png`.

## Colors

| Role | Hex | Usage |
|---|---|---|
| Canvas charcoal | `#15191F` | Main page and favicon background |
| Deeper background | `#111419` | Section contrast |
| Elevated surface | `#232B34` | Cards and menus |
| Panel border | `#3A444F` | Hairlines and cards |
| Lime | `#C4F477` | Accent, active controls, highlighted links |
| Main text | `#F7F9FA` | Headings and body |
| Muted text | `#B2BEC9` | Secondary descriptions |

Implement focus and hover states, ensure accessible contrast, and make the interface usable without relying on color alone. Reserve lime for interactive emphasis and the icon.

## UI implementation

Use React components for the UI and Tailwind utility classes for layout, spacing, typography, responsive behavior, and component states. Keep global CSS to theme tokens and base defaults. Astro owns static routes and document metadata. Hydrate React only for browser interactions; static React components do not send a React runtime to visitors. Format source with Biome.

## Typography and layout

- Use a clean modern sans-serif, preferably system font initially; if a webfont is added, self-host and subset it.
- Clear hierarchy, generous vertical whitespace, modest rounded corners (8–16px), subtle shadows.
- Max content width approximately 1100–1200px; reading sections narrower.
- Responsive project cards: 1 column small screens, 2 on tablets, 3 on desktop.
- Usable down to 320px width; cards should not truncate vital project names.
- Keep card rows equal in height, allowing enough room for six description lines when needed even when headings or author links wrap. Show descriptions in full when they fit the available space; truncate only at the card boundary and show a subtle “Read more…” link only for overflowing descriptions. Preserve full project names and keep author links or suggested names at the bottom.

## Home page sections (ordered)

1. Header: logo, Explore, GitHub, Submit.
2. Hero: `Everything can be remade.` and one supporting sentence.
3. Compact dark search field with a magnifying glass and bordered keyboard shortcut badge.
4. **Featured**: one large editorial highlight plus smaller selected cards on desktop. On mobile, show equal-size cards stacked in featured order, with the first entry on top. If fewer entries exist, adapt gracefully instead of duplicating content. Supporting tools may be featured with a visible **Tool** label and remain separate from reimplementation counts.
5. Browse by category: clear icon labels, counts when known.
6. Recently added: reviewed latest additions; no invented dates.
7. **Project Requests**: place **“Step up to the plate?”** in smaller text after the introductory description; unfulfilled targets, concise contextual descriptions, link to requests index and PR contribution instructions. Show an intentional empty state when no requests exist.
8. Footer: brand/tagline + GitHub, Submit, **About**, and **Disclaimer** links.

## About page

- `/about` presents Remade's story, mission, engineering philosophy, and community contribution links in well-spaced editorial sections, with narrow reading columns.
- Lead with **Everything can be remade.** and preserve **“An implementation is one way to solve a problem, not necessarily the only way.”**
- Celebrate independent engineering, interoperability and preservation without framing the directory as hostile to proprietary software or implying Remade builds the listed projects. Credit their developers and communities.
- Provide secondary navigation to the GitHub repository, contribution guidelines, Project Requests and Disclaimer. External resource links open in new tabs. Badge documentation is not included.
- Render statically without React hydration; include the page in the sitemap and Pagefind index.

## Project Requests page

- Order homepage requests alphabetically by the original software's display name. The requests index defaults to newest first by catalog addition dates in Git; unknown dates come last and ties use the original slug.
- Heading: **Project Requests**
- Explain that these are community wishes, *not active or approved implementation projects*.
- Cards show target, category, description of what should be reproduced, and reference link.
- Primary CTAs: **Submit a request** (PR instructions) and **Know a project? Add it** (PR instructions).
- No fake contributor counts, fake votes, claimed assignments, or implied permission from original owners.
- When a qualifying implementation is merged, remove the associated request entry (validated in CI).

## Explore page

- Search across original software name, project name, description, languages.
- Compact category, language, and platform filters beneath the search field; expandable additional filters for compatibility and development status. Filters apply immediately. Keep sorting beside the result count.
- Sorting: recent, alphabetical, stars. `stars: null` sorts after known counts.
- Cards expose original → implementation relationship at a glance.
- Empty state proposes clearing filters or contributing a new project.
- When a nonempty search has no matching entries, show matching Project Request cards and a link to the requests search. Match names, aliases, suggested names, vendors and requested features, prioritizing title matches. Project-specific filters do not restrict this fallback; clearly label requests as wishes rather than existing implementations.
- Use local data and Pagefind index (no hosted query endpoint).

## Project detail page

- Project title and original-software link.
- Neutral statement of compatibility aims; clearly mark *maintainer-reported* information.
- Primary repository CTA and optional docs link, language/license/category/status tags.
- Show an Official website button beside the repository CTA when a project supplies a documented website; open that link in a new tab.
- Show a Repository Mirrors header below the primary links. When mirrors exist, show a collapsed View Mirrors accordion with bordered links identifying each mirror by host and repository path and opening in new tabs. When none are listed, display “No mirrors found” and a contribution link directly beneath the header, without an accordion. Metadata continues to come from the primary repository.
- GitHub stats (stars, forks, last push and archive status when available).
- Small note: **GitHub statistics are refreshed approximately every 24 hours.**
- Focus/hover timestamp from `fetchedAt` when present; if absent, state `Statistics currently unavailable` instead of implying freshness.
- Known limitations; related implementations of the same original.

## Original-software page

- Original name and official/reliable reference URL.
- Brief factual synopsis, original software category.
- All approved reimplementations targeting that original.
- When there are multiple reimplementations, show a prominent Compare button beside the listing heading. Expand a static side-by-side table of languages, platforms, maintainer-reported compatibility and maturity, license, scope, limitations and cached development activity. Show missing activity as unavailable, include cache freshness, and allow keyboard-accessible horizontal scrolling on small screens. Comparison works without JavaScript.
- Never display a logo or mark in a way that implies an official partnership.

## Accessibility

- Skip-to-content link; proper h1–h3 outline; semantic card links.
- Visible keyboard focus in lime with sufficient contrast.
- Accessible search input labels and live region for filter result counts.
- Reduced-motion support; meaningful icon labels or `aria-hidden` for decoration.
- Decorative branding icon may be empty-alt alongside explicit wordmark.
- Keep each author handle and arrow together on one line; move the complete handle to the next line when needed.
- Disclaimer citations use numbered references and a Sources section; external source links open in a new tab.
