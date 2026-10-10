# Remade

> **Everything can be remade.**

[remade.wiki](https://remade.wiki) is a community-maintained directory of independently developed, open-source software reimplementations.

## Website development

Use the exact pnpm version in `package.json` and Node 22.12 or newer:

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm check
pnpm test
pnpm build
pnpm preview
```

React components render the UI with Tailwind utility classes. Astro handles static routes; only Explore hydrates for interactive filtering. Biome formats frontend source with `pnpm format`.

The production build generates static catalog pages, author groups, a sitemap, and a Pagefind index. Search indexing is available in the production preview; local filters work in development. GitHub metadata is optional and read only from `cache/github-metadata.json`. Recently added uses the first catalog addition recorded in Git; CI checks out full history. No visitor requests go to GitHub.

## Submit a project

1. Read the [submission policy](POLICY.md) and [contribution guide](CONTRIBUTING.md).
2. Check `src/content/catalog/projects/` to make sure the project isn't already listed.
3. Fork this repository and add `src/content/catalog/projects/<github-user>/<project-slug>.yaml`, following [`docs/examples/catalog/projects/project.yaml`](docs/examples/catalog/projects/project.yaml).
4. Reference the original software in `src/content/catalog/originals.yaml`, adding it there if necessary.
5. Open a pull request and confirm you've read and agree to follow `POLICY.md` in the PR checklist.

Submissions are reviewed by maintainers. Merged pull requests appear in the directory.

**Found an existing reimplementation but don't want to open a PR?** [Open a Catalog Suggestion issue](../../issues/new?template=catalog-suggestion.yml). The automated reviewer checks links, duplicates, and repository metadata; maintainers still decide what to list.

**No reimplementation exists yet?** [Open a Project Request issue](../../issues/new?template=project-request.yml) with the software name and why you want it remade. No links are required, or see [CONTRIBUTING.md](CONTRIBUTING.md) to submit one by PR.

**Special Thanks:**
- ArtCraft Suite and it's Discord
- @lumpypotato4764 for the idea of aggregating all of the various initiatives going on within the server
