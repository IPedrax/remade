# Catalog Schema and Editorial Data

## Canonical sources

```text
src/content/catalog/
  originals.yaml           Canonical original programs/interfaces
  featured.yaml            Maintainer-selected project slugs in display order
  projects/<slug>.yaml     One community-submitted reimplementation each
  requests/<original-slug>.yaml  One unfulfilled community request for the original
examples/project.yaml      Example only: never indexed

cache/github-metadata.json Cached API enrichment, not source of truth
```

Use **stable, URL-friendly slugs**; names may change, but slugs should remain stable to avoid broken URLs. Original software has a many-to-one relationship with project records. Do not automatically derive stable original slugs from free-text names.

## Astro content integration

The source files live under `src/content/catalog/`, matching the Astro app's content layout. In Astro 5+, define collection loaders in `src/content.config.ts` that match `projects/*.yaml` and `requests/*.yaml` separately. Keep `originals.yaml` and `featured.yaml` as their existing shared reference/curation files rather than treating them as individual project entries. Use typed Zod schemas matching these files, and let Python CI enforce cross-file relationships and duplicate rules. Example YAML in `examples/` must never be indexed.

## Canonical original record

`src/content/catalog/originals.yaml` contains a list (empty `[]` until seeded):

```yaml
- slug: example-software
  name: Example Software
  url: https://example.org/software
  category: applications
  aliases:
    - Example App
```

An original record identifies the **target**, not a hosting or endorsement relationship.

## Project record

`src/content/catalog/projects/<slug>.yaml` has the fields below:

```yaml
slug: example-implementation
name: Example Implementation
repository: https://github.com/example/example-implementation
original: example-software
category: applications
languages: [Rust]
platforms: [Linux, macOS, Windows]
status: experimental
compatibility: partial
description: Independent implementation targeting the original program's behavior.
license: MIT
# docs: https://example.org/docs       # optional
# limitations: Not all formats are currently supported. # optional
```

### Types and validation

| Field | Required | Notes |
|---|---|---|
| `slug` | Yes | Lowercase `[a-z0-9]+(-[a-z0-9]+)*`; matches YAML filename |
| `name` | Yes | Short nonempty project name |
| `repository` | Yes | Public HTTPS repository root URL. GitHub entries must use `https://github.com/<owner>/<repo>` without trailing slash, `.git`, subpath, query, or fragment. Other Git hosts (including self-hosted Git) may be accepted after maintainer review. |
| `original` | Yes | References exactly one slug in originals list |
| `category` | Yes | `applications`, `operating-systems`, `games`, `developer-tools`, `databases`, `protocols`, `compatibility`, `other` |
| `languages` | Yes | Nonempty list of programming language names |
| `platforms` | No | Optional list of platforms |
| `status` | Yes | `experimental`, `alpha`, `beta`, `stable`, `archived` (self-reported except GitHub archive flag) |
| `compatibility` | Yes | `targeting`, `partial`, `high`, `claimed-complete` (self-reported) |
| `description` | Yes | Plain text, factual, no user-supplied HTML |
| `license` | Yes | SPDX-style identifier or e.g. `LicenseRef-custom` for review |
| `docs` | No | HTTPS URL |
| `limitations` | No | Short plain text |

Compatibility is not scored by Remade. `claimed-complete` is **not** a certification.

### Uniqueness

- `slug` and filename must agree.
- No duplicate normalized repository URLs, using host and namespace/repository identity.
- No duplicate original slugs. A corrected name should use `aliases` instead of creating a second original.
- Prefer stable slugs; maintain redirects for intentional renames in a future Astro implementation.
- Reject unknown fields (to catch typos) and malformed URLs.

## Project Request record

`src/content/catalog/requests/<original-slug>.yaml` describes a **desired reimplementation**, not an existing project:

```yaml
original: example-software
reason: A faithful and independently developed alternative implementation would be useful for study and compatibility.
```

- Filename must match its `original` slug (which must exist in `src/content/catalog/originals.yaml`).
- `reason` is plain text, 20–400 characters, factual and non-promotional.
- No repository, popularity count, bounty, fundraising, deadline, ownership claim, or invented implementation status.
- Exactly one open request per original.
- **Do not list requests for any original with an indexed project.** The catalog validator enforces this; remove the request in the same PR that first adds its implementation.
- A request has a stable link to `/software/<original-slug>` and is displayed on `/requests` and under **Project Requests** on the homepage.
- Requests are distinct from projects and are never mixed into featured listings or project counts.

## Featured manifest

`src/content/catalog/featured.yaml` contains just project slugs, in editorial order:

```yaml
# Maintainer-curated; independent of contributor project metadata.
- project-a
- project-b
```

Every featured slug must point to a valid project. Contributors cannot self-promote by setting a field in their own entry.

## Metadata cache

`cache/github-metadata.json` stores a mapping under `repositories`:

```json
{
  "repositories": {
    "owner/repo": {
      "stars": 123,
      "forks": 4,
      "primaryLanguage": "Rust",
      "pushedAt": "2026-10-01T10:00:00Z",
      "isArchived": false,
      "licenseSpdx": "MIT",
      "fetchedAt": "2026-10-09T08:00:00Z"
    }
  }
}
```

Values in the example are illustrative; a real snapshot only contains successfully fetched metadata. Cache fetch time is **not** the project's last push time. Failure to fetch one repository preserves its previous record.

Repository statistics are collected for GitHub-hosted repositories only. Non-GitHub projects may be listed and will have no GitHub stars or forks. Do not fabricate missing metadata.
