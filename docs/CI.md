# Continuous Integration / Maintenance Plan

No hosting, deployment, DNS, email-provider, or runtime service configuration is included in this project bundle.

For GitHub Issue Forms, create the labels `catalog-suggestion` and `project-request` before enabling submissions. These labels select the appropriate review rules.

## PR checks

Python-based checks run automatically through **uv** using the pinned Python requirements. Contributors are not asked to run local commands.

1. `checks.yml` validates all catalog YAML (projects, originals, **requests**, featured), confirms PR checkbox, and catches duplicate repositories, duplicate slugs and fulfilled requests.
2. `links.yml` scans only newly changed catalog URLs on PRs, using Lychee with low concurrency. When the Astro scaffold exists, this workflow may also scan generated site HTML after `pnpm build`.
3. All PR workflows run read-only, on untrusted forks, using `pull_request` (not `pull_request_target`). Do not execute scripts from submitted repositories.

## Issue suggestion and request checks

- `review-submissions.yml` runs when a `catalog-suggestion` or `project-request` issue is opened, edited, reopened, or labeled. `scripts/review_submission.py` validates both.
- The bot posts **one CI-style issue comment**, updating its existing marked comment on reruns rather than creating a new comment for every edit.
- Warnings appear at the **top** of that comment, ahead of all successful findings. A nonrecognized Git host receives the exact text: **This does not link to a recognized Git provider. Proceed with caution.**
- Catalog Suggestions require a repository URL. Project Requests require a reason but permit no links, in which case Lychee is skipped.
- Below the warning: errors, warnings, informational metadata checks, and the Lychee result. Findings are advisory; maintainers decide whether to accept a suggestion.
- No contributor-supplied repository code runs in this workflow. `issues: write` is needed for the bot comment; it uses the built-in token rather than GitHub App metadata credentials.

## Scheduled checks

- `links.yml` weekly full catalog audit; a failed run is a maintenance alert, not a public deletion.
- `stats.yml` daily GraphQL metadata refresh on trusted default branch (manual dispatch supported). It uses an **organization-owned GitHub App installation token** for GraphQL reads and the built-in `GITHUB_TOKEN` only for writing the metadata snapshot. Updates cached JSON if some repositories succeed, preserving older records for failed lookups.

## GraphQL behavior

- The GitHub App installation has a **5,000 GraphQL point/hour/installation** baseline on GitHub.com for non-Enterprise organizations (potentially higher with scaling); a point is not a repository. Limits and per-field access may change.
- The built-in `GITHUB_TOKEN` is **not tied to a personal account** and could also fetch metadata, with a typical limit of **1,000 GraphQL points/hour/repository**. Use the App when the independent installation budget/identity is desired.
- Repository settings required for the trusted daily job:
  - Create a GitHub App owned by the Remade organization, with **Metadata: Read** only, and install it on the catalog repository.
  - Set Actions variable `REMADE_APP_CLIENT_ID` (App's Client ID).
  - Set Actions secret `REMADE_APP_PRIVATE_KEY` (PEM contents), available only to the trusted repository/workflow; do not expose it to forked PRs, build logs, or the client bundle.
  - Use `actions/create-github-app-token@v3` to mint a one-hour installation token; the script reads `GH_METADATA_TOKEN`. This is separate from the built-in `GITHUB_TOKEN` used to commit `cache/github-metadata.json`.
  - Test a public third-party repository in GraphQL: installation tokens may restrict certain nested fields for repositories **outside** the installation; if GitHub returns `Resource not accessible by integration`, simplify the query fields or use the built-in `GITHUB_TOKEN` for this read-only metadata job.
- Batched alias query at 25 repositories/request (configurable). Monitor reported cost and remaining points; avoid burst concurrency.
- A 24-hour refresh is **best effort**; the UI must show: **GitHub statistics are refreshed approximately every 24 hours.** If a cached record is older, its exact last-successful timestamp must remain discoverable.
- Metadata cache is not an eligibility source. GitHub API failures never remove listings.
- The scheduled workflow commits `cache/github-metadata.json` with the built-in `GITHUB_TOKEN`, **not** the App token, so the App needs no write permission. Such commits do not normally trigger a separate push-triggered GitHub Actions workflow; the future site refresh must be explicitly integrated. Hosting setup is outside this package.

## Link checking

- Extract catalog URLs from validated YAML; do not depend on Lychee's best-effort YAML parsing.
- PR check checks changed catalog files only to avoid blocking unrelated PRs on old broken links.
- Weekly check checks all catalog links.
- Once `dist/` exists, Lychee checks generated pages and internal links after the Astro build.
- Treat 403/429 as an investigation item before exclusion. `.lycheeignore` is for documented, temporary exceptions, not a blanket bypass.

## Security

- Keep checkout and workflow permissions at minimum. Never use powerful repo secrets to run PR-modified code.
- Validate HTTPS reference domains and GitHub repository URLs. No link-preview proxy or crawling arbitrary payloads at runtime.
- Render submitted descriptions escaped and never permit arbitrary HTML in catalog text.


## Python dependency management

The entire Python automation suite uses one uv project within `scripts/` and workspace definition in `scripts/pyproject.toml`. Python 3.14 is selected by `scripts/.python-version`, and GitHub Actions uses `astral-sh/setup-uv`. No `requirements.txt`, pip installation steps, or individual script environments are supported.

The initial package intentionally has no `scripts/uv.lock` because its dependencies could not be resolved in the artifact generation environment. The first connected uv invocation resolves and creates the lockfile automatically. Once generated, commit that file and use locked execution in workflows for stronger reproducibility. This does not require contributors to install anything or run setup commands locally.
