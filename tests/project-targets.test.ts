import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import * as v from "valibot";
import EntryCard from "../src/components/EntryCard";
import ProjectPage from "../src/components/pages/ProjectPage";
import SoftwarePage from "../src/components/pages/SoftwarePage";
import { loadCatalog } from "../src/lib/catalog";
import { catalogExport } from "../src/lib/catalog-export";
import { matchingImplementations } from "../src/lib/request-browse";
import { projectSchema, validateRelationships } from "../src/lib/schemas";

test("Plane appears once in the catalog and under all four targets, with searchable links", async () => {
	const catalog = await loadCatalog();
	const project = catalog.projects.find((p) => p.slug === "plane");
	assert.ok(project);
	assert.equal(
		catalog.projects.filter((p) => p.repository === project.repository).length,
		1,
	);
	assert.deepEqual(project.originals, ["jira", "linear", "monday", "clickup"]);
	const entry = catalog.entries.find((e) => e.slug === project.slug);
	assert.ok(entry);
	const card = renderToStaticMarkup(
		createElement(EntryCard, { entry, originals: catalog.originals }),
	);
	const page = renderToStaticMarkup(
		createElement(ProjectPage, { project, catalog, metadata: {} }),
	);
	for (const slug of project.originals) {
		const original = catalog.originals.find((o) => o.slug === slug);
		assert.ok(original);
		assert.ok(card.includes(`/software/${slug}/`));
		assert.ok(page.includes(`/software/${slug}/`));
		const software = renderToStaticMarkup(
			createElement(SoftwarePage, { original, catalog, metadata: {} }),
		);
		assert.ok(software.includes("/projects/plane/"));
		assert.equal(
			matchingImplementations(catalog, original.name).filter(
				(e) => e.slug === "plane",
			).length,
			1,
		);
		assert.throws(
			() =>
				validateRelationships({
					...catalog,
					requests: [
						{
							original: slug,
							reason: "Please faithfully recreate this software.",
						},
					],
				}),
			/Fulfilled request/,
		);
	}
	const exported = catalogExport(catalog, "https://remade.wiki/");
	assert.deepEqual(
		exported.projects.find((p) => p.slug === "plane")?.originals,
		project.originals,
	);
	for (const originals of [
		[],
		"linear",
		null,
		[null],
		["linear", "linear"],
		["bad slug"],
	]) {
		assert.throws(() => v.parse(projectSchema, { ...project, originals }));
	}
	const { originals, ...withoutTargets } = project;
	for (const invalid of [
		withoutTargets,
		{ ...withoutTargets, original: originals[0] },
		{ ...project, original: originals[0] },
		{ ...project, additional_originals: ["linear"] },
	]) {
		assert.throws(() => v.parse(projectSchema, invalid));
	}
	for (const originals of [["missing"], ["jira", "jira"]]) {
		assert.throws(() =>
			validateRelationships({
				...catalog,
				projects: [{ ...project, originals }],
			}),
		);
	}
});
