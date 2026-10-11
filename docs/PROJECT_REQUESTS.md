# Project Requests

**Homepage section:** Project Requests  

## Purpose

Show software and interfaces that community members want faithfully reimplemented but for which Remade currently has **no qualifying indexed implementation**. A request is **not a project listing**, announcement, challenge bounty, sign of legal permission, nor an assignment.

## Contributor experience

- Navigate to `/requests` from the homepage section.
- Browse requested originals, their reference links, the reason for a remake and any suggested names.
- Search `/requests` by software name, aliases, suggested names, vendor or requested features. Title matches rank first, with the selected sort breaking ties. Filter by vendor, category and addition date (past 7, 30 or 90 days, or the past year). Sort newest first, oldest first or alphabetically. Search and filters are reflected in the URL and can be cleared; browsing remains available without JavaScript.
- Select **Submit a request** to open `.github/ISSUE_TEMPLATE/project-request.yml` for a link-free suggestion; maintainers review it and accepted catalog entries still require a PR adding `src/content/catalog/requests/<vendor>/<original-slug>.yaml`; create an original in `src/content/catalog/originals.yaml` if needed.
- Select **Know an implementation?** to submit `src/content/catalog/projects/<github-user>/<slug>.yaml` by PR instead.
- No login on Remade, runtime comments, upvotes, or status claims. GitHub account required to open an Issue or PR.

## Rules and publication

- A request must target one canonical original slug and must be original-specific and factual.
- Search existing project records and request records before submitting.
- Validator rejects requests for originals with a project already indexed.
- When the first qualifying project is accepted, remove the request record in that same PR; the implementation then appears under the original's software page.
- Maintainers have editorial discretion to decline/remove requests. Avoid invitations to copy code, redistribute copyrighted assets or circumvent access controls.

## Layout

- Homepage below Recently added: **Project Requests**: the first three open requests alphabetically by software name, **View all requests** link.
- `/requests`: compact card grid with original target name, category, plain-text reason, optional suggested names labeled as naming ideas, reference URL, and contribution CTA.
- `/software/[slug]`: when an open request exists, display a gentle **No implementation listed yet** state with **Help make it happen** pointing to contribution instructions.
- When no requests exist, show a friendly empty state instead of fabricated cards.

## Technical model

`src/content/catalog/requests/<vendor>/<original-slug>.yaml` requires the `original` slug and a short `reason`, and accepts optional `suggested_names` as defined in `docs/CATALOG.md`. Requests are joined against `src/content/catalog/originals.yaml` and the set of projects during validation/build. Supporting tools do not fulfill requests. `src/content/catalog/requests/` files are PR-managed source data; the generated site is fully static. Issue requests are unlisted proposals until a maintainer merges an eligible catalog PR. Request issues may omit all links; catalog publication still requires the original reference URL.
