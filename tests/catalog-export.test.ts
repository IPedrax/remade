import assert from "node:assert/strict";
import { test } from "node:test";
import { loadCatalog } from "../src/lib/catalog";
import {
	catalogExport,
	jsonResponse,
	requestsExport,
} from "../src/lib/catalog-export";

const site = "https://remade.wiki/";

test("exports preserve public relationships and strip unlisted fields at every level", async () => {
	const catalog = await loadCatalog();
	const internal = { reviewNotes: "PRIVATE EDITORIAL NOTE", id: "INTERNAL ID" };
	const originals = catalog.originals.map((o) => ({ ...o, ...internal }));
	const output = catalogExport(
		{
			originals,
			projects: catalog.entries
				.filter((e) => e.kind === "project")
				.map((p) => ({ ...p, ...internal })),
			tools: catalog.entries
				.filter((e) => e.kind === "tool")
				.map((t) => ({
					...t,
					...internal,
					mirrors: ["https://codeberg.org/example/tool"],
					languages: ["JavaScript"],
					status: "beta" as const,
					docs: "https://example.org/docs",
					website: "https://example.org",
					limitations: "Some host APIs are not supported.",
				})),
			featured: catalog.featured,
		},
		site,
	);
	const requests = requestsExport(
		{
			originals,
			requests: catalog.requests.map((r) => ({ ...r, ...internal })),
		},
		site,
	);
	const serialized = JSON.stringify({ output, requests });
	assert.ok(!serialized.includes("PRIVATE EDITORIAL NOTE"));
	assert.ok(!serialized.includes("INTERNAL ID"));
	assert.equal(output.schemaVersion, 1);
	assert.equal(output.projects.length, catalog.projects.length);
	assert.equal(output.tools.length, catalog.tools.length);
	assert.equal(requests.requests.length, catalog.requests.length);
	assert.deepEqual(output.featured, catalog.featured);
	for (const project of output.projects) {
		assert.ok(
			project.originals.every((slug) =>
				output.originals.some((o) => o.slug === slug),
			),
		);
		assert.ok(!("original" in project));
		assert.ok(!("additional_originals" in project));
		assert.equal(project.pageUrl, `${site}projects/${project.slug}/`);
	}
	assert.equal(
		output.tools.find((t) => t.slug === "lazymaplayers-effectcraft")?.license,
		"MIT",
	);
	for (const tool of output.tools) {
		assert.deepEqual(tool.mirrors, ["https://codeberg.org/example/tool"]);
		assert.deepEqual(tool.languages, ["JavaScript"]);
		assert.equal(tool.status, "beta");
		assert.equal(tool.docs, "https://example.org/docs");
		assert.equal(tool.website, "https://example.org");
		assert.equal(tool.limitations, "Some host APIs are not supported.");
		assert.equal(tool.pageUrl, `${site}tools/${tool.slug}/`);
		assert.ok(
			tool.projects.every((slug) =>
				output.projects.some((p) => p.slug === slug),
			),
		);
	}
	for (const request of requests.requests) {
		assert.equal(request.software.slug, request.original);
		assert.equal(
			request.software.pageUrl,
			`${site}software/${request.original}/`,
		);
		assert.ok(
			!output.projects.some((p) => p.originals.includes(request.original)),
		);
	}
	assert.deepEqual(
		output.projects.map((p) => p.slug),
		output.projects.map((p) => p.slug).sort(),
	);
});

test("request export fails for dangling originals", () => {
	assert.throws(
		() =>
			requestsExport(
				{
					originals: [],
					requests: [
						{
							original: "missing",
							reason: "A compatible implementation is requested.",
							vendor: "example",
						},
					],
				},
				site,
			),
		/Unknown exported request original/,
	);
});

test("JSON responses allow public cross-origin reads and one-hour caching", async () => {
	const response = jsonResponse({ schemaVersion: 1 });
	assert.equal(
		response.headers.get("Content-Type"),
		"application/json; charset=utf-8",
	);
	assert.equal(response.headers.get("Cache-Control"), "public, max-age=3600");
	assert.equal(response.headers.get("Access-Control-Allow-Origin"), "*");
	assert.deepEqual(await response.json(), { schemaVersion: 1 });
});
