# Python tooling (uv)

Remade's Python tooling is a standalone uv project rooted at `scripts/`. The Astro application lives in `apps/frontend/remade-wiki/`; the shared pnpm workspace and lockfile stay at the repository root.

- Runtime: Python 3.14 pinned in `scripts/.python-version`.
- Manifest: `scripts/pyproject.toml` is the only Python dependency source. There is no `requirements.txt`.
- Environment: uv manages the shared environment for the entire `scripts/` tool suite. No per-script dependency declarations or environments.
- Lockfile: commit `scripts/uv.lock` once a connected environment resolves dependencies. Until then, CI resolves dependencies automatically. After committing it, use `uv run --locked` in the workflows.
- CI: use `uv run --project scripts` so all tools share the same project while paths and generated files remain relative to the repository root.
- Workspace: `[tool.uv.workspace]` can remain an empty workspace at `scripts/` until multiple packages are actually needed.
- Contributors do not need to install Python or run scripts locally. CI executes the validation and reviews automatically.

Do not move the Python manifest to the Astro root and do not install Python dependencies via pnpm.
