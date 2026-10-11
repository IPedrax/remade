import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ProjectComparison from "../src/components/ProjectComparison";
import type { Entry, Metadata } from "../src/lib/catalog";

const project: Extract<Entry, { kind: "project" }> = {
	kind: "project",
	slug: "alpha",
	name: "Alpha",
	repository: "https://github.com/example/alpha",
	originals: ["target"],
	category: "creative",
	languages: ["Rust"],
	platforms: ["Linux", "Windows"],
	status: "experimental",
	compatibility: "targeting",
	description: "Targets familiar animation editing workflows.",
	license: "MIT",
	limitations: "Project files are not yet supported.",
};
const second = {
	...project,
	slug: "beta",
	name: "Beta",
	repository: "https://codeberg.org/example/beta",
	platforms: undefined,
};
const stats: Metadata = {
	stars: 0,
	forks: 0,
	pushedAt: "2026-10-10T12:00:00Z",
	isArchived: true,
	fetchedAt: "2026-10-11T12:00:00Z",
};

test("comparison is omitted for fewer than two implementations", () => {
	for (const projects of [[], [project]])
		assert.equal(
			renderToStaticMarkup(
				createElement(ProjectComparison, {
					projects,
					metadata: {},
					originalName: "Target",
				}),
			),
			"",
		);
});

test("comparison renders static project columns, limitations and honest activity fallbacks", () => {
	const html = renderToStaticMarkup(
		createElement(ProjectComparison, {
			projects: [project, second],
			metadata: { "example/alpha": stats },
			originalName: "Target",
		}),
	);
	for (const value of [
		"Compare",
		"/projects/alpha/",
		"/projects/beta/",
		"Languages",
		"Linux, Windows",
		"Not documented",
		"Targeting",
		"Experimental",
		"MIT",
		"Project files are not yet supported.",
		"Archived",
		"Unavailable",
		"Statistics updated",
		"2026-10-10T12:00:00Z",
		'scope="col"',
		'scope="row"',
	])
		assert.ok(html.includes(value), value);
	assert.ok(html.includes("<details"));
	assert.ok(!html.includes("<details open"));
	assert.ok(!html.includes("<script"));
});
