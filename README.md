# Remade

> **Everything can be remade.**

[remade.wiki](https://remade.wiki) is a community-maintained directory of independently developed, open-source software reimplementations.

<img width="1727" height="611" alt="Remade.wiki website header" src="https://github.com/user-attachments/assets/a483cd7b-4912-451b-a2b7-ddfcc0dc5ccc" />


## Submit a project

1. Read the [submission policy](POLICY.md) and [contribution guide](CONTRIBUTING.md).
2. Check `apps/frontend/remade-wiki/src/content/catalog/projects/` to make sure the project isn't already listed.
3. Fork this repository and add `apps/frontend/remade-wiki/src/content/catalog/projects/<github-user>/<project-slug>.yaml`, following [`docs/examples/catalog/projects/project.yaml`](docs/examples/catalog/projects/project.yaml).
4. Reference the original software in `apps/frontend/remade-wiki/src/content/catalog/originals.yaml`, adding it there if necessary.
5. Open a pull request and confirm you've read and agree to follow `POLICY.md` in the PR checklist.

Submissions are reviewed by maintainers. Merged pull requests appear in the directory.

**Found an existing reimplementation but don't want to open a PR?** [Open a Catalog Suggestion issue](../../issues/new?template=catalog-suggestion.yml). The automated reviewer checks links, duplicates, and repository metadata; maintainers still decide what to list.

**No reimplementation exists yet?** [Open a Project Request issue](../../issues/new?template=project-request.yml) with the software name and why you want it remade. No links are required, or see [CONTRIBUTING.md](CONTRIBUTING.md) to submit one by PR.

## Listed on Remade?

Help people discover your listing: add a **Listed on Remade** badge to your README, website, or documentation. Open your project or tool page and use its **Share** section to copy a Markdown, HTML, or BBCode snippet.

[Get your Remade badge →](https://remade.wiki/about/badges/)

## Public catalog data

Agents and other tools can read the build-generated [catalog JSON](https://remade.wiki/data/catalog.json) and [open project requests JSON](https://remade.wiki/data/requests.json). Both allow cross-origin access from anywhere. See the [export format](docs/CATALOG.md#public-machine-readable-exports) for fields and versioning.

**Special Thanks:**
- ArtCraft and its Discord server
- @lumpypotato4764 for the idea of aggregating all of the various initiatives going on within the server
- @naz888z for lots of help curating
