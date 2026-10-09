# Project Requests

**Homepage section:** Project Requests  

## Purpose

Show software and interfaces that community members want faithfully reimplemented but for which Remade currently has **no qualifying indexed implementation**. A request is **not a project listing**, announcement, challenge bounty, sign of legal permission, nor an assignment.

## Contributor experience

- Navigate to `/requests` from the homepage section.
- Browse requested originals, their reference links and the reason for a remake.
- Select **Submit a request** to open `.github/ISSUE_TEMPLATE/project-request.yml` for a link-free suggestion; maintainers review it and accepted catalog entries still require a PR adding `src/content/catalog/requests/<original-slug>.yaml`; create an original in `src/content/catalog/originals.yaml` if needed.
- Select **Know an implementation?** to submit `src/content/catalog/projects/<slug>.yaml` by PR instead.
- No login on Remade, runtime comments, upvotes, or status claims. GitHub account required to open an Issue or PR.

## Rules and publication

- A request must target one canonical original slug and must be original-specific and factual.
- Search existing project records and request records before submitting.
- Validator rejects requests for originals with a project already indexed.
- When the first qualifying project is accepted, remove the request record in that same PR; the implementation then appears under the original's software page.
- Maintainers have editorial discretion to decline/remove requests. Avoid invitations to copy code, redistribute copyrighted assets or circumvent access controls.

## Layout

- Homepage below Recently added: **Project Requests**: 3–4 recent/editorially selected open requests, **View all requests** link.
- `/requests`: compact card grid with original target name, category, plain-text reason, reference URL, and contribution CTA.
- `/software/[slug]`: when an open request exists, display a gentle **No implementation listed yet** state with **Help make it happen** pointing to contribution instructions.
- When no requests exist, show a friendly empty state instead of fabricated cards.

## Technical model

`src/content/catalog/requests/<original-slug>.yaml` has exactly the required `original` slug and a short `reason`. Requests are joined against `src/content/catalog/originals.yaml` and the set of projects during validation/build. `src/content/catalog/requests/` files are PR-managed source data; the generated site is fully static. Issue requests are unlisted proposals until a maintainer merges an eligible catalog PR. Request issues may omit all links; catalog publication still requires the original reference URL.
