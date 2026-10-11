import assert from "node:assert/strict";
import { test } from "node:test";
import * as v from "valibot";
import {
	type BrowseEntry,
	compareEntries,
	filterEntries,
} from "../src/lib/browse";
import { loadCatalog, loadMetadata } from "../src/lib/catalog";
import { badgeLanguages, entryCategories } from "../src/lib/presentation";
import {
	type Catalog,
	parseYaml,
	projectSchema,
	toolSchema,
	validateRelationships,
} from "../src/lib/schemas";

test("catalog preserves all authored entries and tool relationships", async () => {
	const catalog = await loadCatalog();
	assert.equal(
		catalog.entries.length,
		catalog.projects.length + catalog.tools.length,
	);
	for (const entry of catalog.entries) assert.ok(entry.slug);
	for (const slug of catalog.featured)
		assert.ok(catalog.entries.some((e) => e.slug === slug));
});
test("YAML rejects duplicate keys and invalid tags", () => {
	assert.throws(() => parseYaml("slug: one\nslug: two"));
	assert.throws(() => parseYaml("slug: !execute dangerous"));
});
test("strict schemas reject unknown fields, markup, bad URLs and malformed platforms", async () => {
	const c = await loadCatalog();
	const p = c.projects[0];
	const t = c.tools[0];
	const { languages: _languages, ...withoutLanguages } = t;
	assert.throws(() => v.parse(toolSchema, withoutLanguages));
	for (const extra of [
		{ unknown: true },
		{ description: "<script>alert(1)</script>" },
		{ repository: "https://localhost/x/y" },
		{ website: "http://example.org" },
		{ website: "https://localhost/" },
		{ mirrors: [] },
		{ mirrors: "https://codeberg.org/example/project" },
		{ mirrors: ["http://codeberg.org/example/project"] },
		{ mirrors: ["https://github.com/example/project/issues"] },
		{
			mirrors: [
				"https://codeberg.org/example/project",
				"https://codeberg.org/example/project.git",
			],
		},
		{ platforms: "Web" },
		{ authors: ["invalid--handle"] },
	])
		assert.throws(() => v.parse(projectSchema, { ...p, ...extra }));
	assert.throws(() => v.parse(toolSchema, { ...t, platforms: [null] }));
	for (const extra of [
		{ languages: [] },
		{ languages: [null] },
		{ status: "unknown" },
		{ docs: "http://example.org" },
		{ website: "https://localhost/" },
		{ limitations: "<b>bad</b>" },
		{ limitations: null },
	])
		assert.throws(() => v.parse(toolSchema, { ...t, ...extra }));
	for (const mirrors of [
		[],
		"https://codeberg.org/example/tool",
		["http://example.org/tool"],
		["https://github.com/example/tool/issues"],
		[
			"https://codeberg.org/example/tool",
			"https://codeberg.org/example/tool.git",
		],
	])
		assert.throws(() => v.parse(toolSchema, { ...t, mirrors }));
	assert.deepEqual(
		v.parse(toolSchema, {
			...t,
			mirrors: ["https://codeberg.org/example/tool"],
		}).mirrors,
		["https://codeberg.org/example/tool"],
	);
	const details = {
		languages: ["JavaScript"],
		status: "beta",
		docs: "https://example.org/docs",
		website: "https://example.org",
		limitations: "Some host APIs are not supported.",
	};
	const parsed = v.parse(toolSchema, { ...t, ...details });
	for (const key of [
		"languages",
		"status",
		"docs",
		"website",
		"limitations",
	] as const)
		assert.deepEqual(parsed[key], details[key]);

	for (const license of [null, "", 42, "<b>MIT</b>"])
		assert.throws(() => v.parse(toolSchema, { ...t, license }));
	assert.equal(v.parse(toolSchema, { ...t, license: "MIT" }).license, "MIT");
	assert.deepEqual(
		v.parse(projectSchema, {
			...p,
			mirrors: ["https://codeberg.org/example/project"],
		}).mirrors,
		["https://codeberg.org/example/project"],
	);
	assert.equal(
		v.parse(projectSchema, { ...p, website: "https://example.org/" }).website,
		"https://example.org/",
	);
	assert.equal(
		v.parse(toolSchema, { ...t, platforms: ["Web"] }).platforms?.[0],
		"Web",
	);
});
test("relationships reject duplicates, dangling references and fulfilled requests", async () => {
	const c = await loadCatalog();
	const cases: Catalog[] = [
		{ ...c, projects: [...c.projects, c.projects[0]] },
		{ ...c, featured: ["missing"] },
		{ ...c, tools: [{ ...c.tools[0], projects: ["missing"] }] },
		{
			...c,
			requests: [
				{
					original: c.projects[0].originals[0],
					reason: "A compatible implementation would be useful.",
				},
			],
		},
	];
	for (const input of cases) assert.throws(() => validateRelationships(input));
});
const entry: BrowseEntry = {
	name: "Alpha",
	search: "Alpha Photoshop Rust",
	category: "other",
	languages: ["Rust"],
	platforms: ["Web"],
	status: "alpha",
	compatibility: "partial",
	stars: null,
	addedAt: "",
};
test("filters combine query terms and exact facets", () => {
	assert.ok(filterEntries(entry, { q: "PHOTO rust", platform: "Web" }));
	assert.equal(
		filterEntries(entry, { q: "photoshop", platform: "Windows" }),
		false,
	);
	assert.equal(filterEntries(entry, { status: "stable" }), false);
});
test("star sorting puts missing values after real zeroes; recent uses catalog dates", () => {
	assert.ok(compareEntries(entry, { ...entry, stars: 0 }, "stars") > 0);
	assert.ok(
		compareEntries(
			{ ...entry, addedAt: "2026-10-09" },
			{ ...entry, addedAt: "2026-10-01" },
			"recent",
		) < 0,
	);
});
test("metadata is optional and never controls entry inclusion", async () => {
	const metadata = await loadMetadata();
	assert.equal(typeof metadata, "object");
	assert.ok((await loadCatalog()).entries.length);
});

test("language badges hide JavaScript without changing recorded languages", () => {
	const languages = ["JavaScript", "TypeScript", "Rust"];
	assert.deepEqual(badgeLanguages(languages), ["TypeScript", "Rust"]);
	assert.deepEqual(languages, ["JavaScript", "TypeScript", "Rust"]);
	assert.deepEqual(badgeLanguages(["JavaScript", "Rust"]), [
		"JavaScript",
		"Rust",
	]);
	assert.deepEqual(badgeLanguages(["JS", "TS"]), ["TS"]);
	assert.deepEqual(badgeLanguages(["typescript", "javascript"]), [
		"typescript",
	]);
});

test("tool categories follow all supported projects and remain filterable as tools", async () => {
	const catalog = await loadCatalog();
	const tool = catalog.entries.find(
		(entry) => entry.kind === "tool" && entry.slug === "openplayground",
	);
	assert.ok(tool);
	const expected = [
		...new Set(
			catalog.projects
				.filter(
					(project) =>
						tool.kind === "tool" && tool.projects.includes(project.slug),
				)
				.map((project) => project.category),
		),
	];
	assert.deepEqual(entryCategories(tool, catalog.projects), expected);
	const browse = { ...entry, category: "tools", categories: expected };
	for (const category of expected)
		assert.ok(filterEntries(browse, { category }));
	assert.ok(filterEntries(browse, { category: "tools" }));
	assert.ok(!filterEntries(browse, { category: "games" }));
});
