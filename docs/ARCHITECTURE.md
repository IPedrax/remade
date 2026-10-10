# Architecture

## Principles

1. Entire user-facing site generated as static Astro HTML/assets.
2. Git repo is the only canonical catalog datastore; no runtime backend.
3. No user-provided code is executed during validation, indexing, or compilation.
4. No GitHub API calls from visitors; GitHub metadata is a **cached build input**.
5. Failure to refresh metadata must never delete a valid listing.
6. Editorial curation and accepted contributions are reproducible in Git history.

## Data pipeline

```text
Contributor PR (src/content/catalog/projects/<github-user>/<slug>.yaml OR src/content/catalog/requests/<vendor>/<original-slug>.yaml)
    ↓  read-only validation + Lychee + policy acknowledgment
Maintainer reviews → merges
    ↓
Git-tracked project YAML + original records + featured selections
    ├── catalog validator (schema, unique ids, URLs, references, unfulfilled requests)
    ├── cached cache/github-metadata.json (stars/forks/etc.)
    └── Astro static build
           ├── /                       Featured, recently added
           ├── /explore                filters/sort + search
           ├── /software/[slug]        one original → many projects
           ├── /projects/[slug]        individual project
           ├── /authors/[github-user] attributed indexed projects and tools
           ├── /requests              unfulfilled community requests
           ├── /disclaimer            approved text
           └── Pagefind index         no hosted search service

Trusted scheduled metadata job (roughly every 24h)
    ↓
GitHub GraphQL: batched repository aliases
    ↓
Update cache snapshot → next static build consumes it
```

## GitHub statistics and rate limits

The trusted daily metadata job fetches data using a **short-lived organization-owned GitHub App installation token**, normally 5,000 GraphQL points/hour per installation for a non-Enterprise organization. The built-in GitHub Actions `GITHUB_TOKEN` (1,000 points/hour/repository) remains available for normal CI and commits. Neither limit is a cap on catalog entries. Batch ~25 repository aliases/query; tune against actual response cost, node, timeout, and secondary rate limits. Some fields on third-party public repositories may be restricted to GitHub App installation tokens; verify the metadata query and fall back to the built-in `GITHUB_TOKEN` for reads if necessary.

**Cache design:** `cache/github-metadata.json` maps a normalized `owner/repo` key to stargazers, forks, primary language, license SPDX, `pushedAt`, `isArchived`, and a `fetchedAt` timestamp per successful record. A failed response leaves previous values intact. New entries whose API fetch fails render gracefully without counts. Never sort absent values as `0` or infer inactivity from API failure.

**Refreshing:** schedule the trusted collector daily. The refresh action may commit the snapshot to the main branch if that approach is selected during site implementation. Note that commits made with `GITHUB_TOKEN` generally do not trigger arbitrary downstream `push` Actions; integrate regeneration in the trusted build chain if needed. Do not set up a second always-on service.

**Page wording:** “GitHub statistics are refreshed approximately every 24 hours.” A tooltip shows `fetchedAt` for the displayed repository. Do **not** claim the data is live; successful fetches may be older if GitHub was unavailable.

**Do not** request actual stars in the visitor's browser: that would consume shared anonymous limits and make server-rendered sorting unstable.

## Static build stages

1. Load and validate original records, projects, supporting tools, requests, and `featured.yaml`. Tools are a separate collection joined to existing project slugs; they do not count as implementations or fulfill requests. Featured selections may include tools labeled Tool.
2. Join each project with one canonical original by slug.
   Read explicit project/tool `authors` GitHub handles directly from entry YAML; group all indexed entries for static author pages independently of featured selection. Never fetch GitHub repositories from visitors or infer attribution from repository owners.
3. Merge cached GitHub metadata (optional/null-safe).
4. Generate static detail, grouping, browse, and unfulfilled request pages.
5. Build Pagefind search index against generated HTML.
6. Use Lychee to check generated internal/local links and outbound URLs.
7. Keep last successful static output if any critical build input cannot be validated.

## CI security

- On forked PRs, use `pull_request` with minimal read permissions; never run arbitrary repo scripts with elevated secrets under `pull_request_target`.
- PRs are untrusted: validate YAML with safe parsing, reject credential-like URLs and file paths, and render all submitted text as escaped/plain text (not arbitrary HTML).
- Restrict contributor PRs from editing `src/content/catalog/featured.yaml` without maintainer review; editorial approval cannot be inferred from their submission.
- Keep secrets out of catalog and PR logs. Only the trusted scheduled workflow can access the App private key and mint a short-lived installation token. PR checks continue with minimal built-in `GITHUB_TOKEN` permissions.
- Static build should not fetch from URLs submitted by users except tightly controlled link check/metadata requests. No arbitrary executable download or code execution.
- Avoid dangerous `yaml.load`; use `safe_load` and validate types. Check domain and URL structure to reduce SSRF or unexpected hosts.

## Handling failures

| Failure | Expected behavior |
|---|---|
| GraphQL timeout/rate limit | Keep previous snapshot; retry conservatively next refresh |
| Missing/renamed GitHub repo | Mark for review; don't silently remove catalog entry |
| Broken external link | Fail new-entry PR check or notify maintainer in periodic audit |
| Third-party 403/429 | Investigate; don't blanket-whitelist the host |
| Invalid schema/duplicate project | Block merge via required validation |
| Broken featured reference | Fail validation or warn while omitting the missing card (prefer fail in CI) |
| Removed featured project | Remove/edit featured manifest in same PR |

## Dependencies

Astro, React, strict TypeScript, Tailwind CSS, Valibot, Pagefind, Python 3 with uv-managed PyYAML for catalog validation and metadata scripts, and Lychee in CI. React components provide the shared UI and page content; Astro handles static routes, document metadata, and build-time catalog loading. Tailwind utility classes style the UI, with global CSS limited to theme tokens and base defaults. With the Astro React integration, React components render to HTML at build time by default and send no React runtime to visitors. A `client:*` directive opts a component into browser hydration; use hydration only for interactions that need it, with focused components and a working static browsing baseline. See [Astro’s framework component documentation](https://docs.astro.build/en/guides/framework-components/).

Reference: https://docs.github.com/en/graphql/overview/rate-limits-and-query-limits-for-the-graphql-api

## Package manager

Use pnpm for frontend dependencies, lockfile and task scripts. Commit `pnpm-lock.yaml`; declare the pnpm version in `package.json` using `packageManager`. Do not introduce `package-lock.json` or Yarn.

## Python tooling

Use **uv** for every Python dependency and execution in CI and automation. Python dependencies are declared in `scripts/pyproject.toml`, managed as a single uv project inside `scripts/`, and installed by uv automatically during CI runs. The `scripts/uv.lock` file is generated by uv and should be committed once dependency resolution has been completed. Validation, testing, and metadata refresh happen automatically without contributor setup.
