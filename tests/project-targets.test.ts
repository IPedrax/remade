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
import {
	projectOriginals,
	projectSchema,
	validateRelationships,
} from "../src/lib/schemas";

test("Plane appears once in the catalog and under all four targets, with searchable links", async () => {
	const catalog = await loadCatalog();
	const project = catalog.projects.find((p) => p.slug === "plane");
	assert.ok(project);
	assert.equal(
		catalog.projects.filter((p) => p.repository === project.repository).length,
		1,
	);
	assert.deepEqual(projectOriginals(project), [
		"jira",
		"linear",
		"monday",
		"clickup",
	]);
	const entry = catalog.entries.find((e) => e.slug === project.slug);
	assert.ok(entry);
	const card = renderToStaticMarkup(
		createElement(EntryCard, { entry, originals: catalog.originals }),
	);
	const page = renderToStaticMarkup(
		createElement(ProjectPage, { project, catalog, metadata: {} }),
	);
	for (const slug of projectOriginals(project)) {
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
		exported.projects.find((p) => p.slug === "plane")?.additional_originals,
		project.additional_originals,
	);
	for (const additional_originals of [
		[],
		"linear",
		["linear", "linear"],
		["bad slug"],
	]) {
		assert.throws(() =>
			v.parse(projectSchema, { ...project, additional_originals }),
		);
	}
	for (const additional_originals of [["missing"], [project.original]]) {
		assert.throws(() =>
			validateRelationships({
				...catalog,
				projects: [{ ...project, additional_originals }],
			}),
		);
	}
});
