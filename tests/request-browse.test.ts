import assert from "node:assert/strict";
import { test } from "node:test";
import { loadCatalog } from "../src/lib/catalog";
import {
	type BrowseRequest,
	compareRequests,
	defaultRequestFilters,
	filterRequest,
} from "../src/lib/request-browse";

const now = new Date("2026-10-10T12:00:00Z");
const request: BrowseRequest = {
	original: "example",
	name: "Example",
	vendor: "adobe",
	category: "creative",
	addedAt: "2026-10-05T12:00:00Z",
};

test("request search matches names, aliases, suggestions and features while combining filters", () => {
	const item = {
		...request,
		aliases: ["Legacy Title"],
		suggestedNames: ["ExampleCraft"],
		reason: "Compatible brush workflows",
	};
	for (const q of [" EXAMPLE ", "legacy title", "examplecraft", "adobe brush"])
		assert.ok(filterRequest(item, { ...defaultRequestFilters, q }, now));
	assert.equal(
		filterRequest(item, { ...defaultRequestFilters, q: "missing" }, now),
		false,
	);
	assert.equal(
		filterRequest(
			item,
			{ ...defaultRequestFilters, q: "Example", vendor: "apple" },
			now,
		),
		false,
	);
});

test("request filters combine vendor, category and addition period", () => {
	assert.ok(
		filterRequest(
			request,
			{
				...defaultRequestFilters,
				vendor: "adobe",
				category: "creative",
				added: "7",
			},
			now,
		),
	);
	assert.equal(
		filterRequest(request, { ...defaultRequestFilters, vendor: "apple" }, now),
		false,
	);
	assert.equal(
		filterRequest(
			request,
			{ ...defaultRequestFilters, category: "engineering" },
			now,
		),
		false,
	);
	assert.equal(
		filterRequest(
			{ ...request, addedAt: "2026-09-01T00:00:00Z" },
			{ ...defaultRequestFilters, added: "7" },
			now,
		),
		false,
	);
});

test("date filters include boundary dates and exclude unknown or future dates", () => {
	const filters = { ...defaultRequestFilters, added: "7" };
	assert.ok(
		filterRequest(
			{ ...request, addedAt: "2026-10-03T12:00:00Z" },
			filters,
			now,
		),
	);
	for (const addedAt of [undefined, "invalid", "2026-10-11T00:00:00Z"])
		assert.equal(filterRequest({ ...request, addedAt }, filters, now), false);
	assert.ok(
		filterRequest(
			{ ...request, addedAt: undefined },
			defaultRequestFilters,
			now,
		),
	);
});

test("request sorts compare actual instants and keep unknown dates last in either date direction", () => {
	const newer = {
		...request,
		original: "newer",
		addedAt: "2026-10-06T00:30:00+02:00",
	};
	const older = {
		...request,
		original: "older",
		addedAt: "2026-10-05T22:00:00Z",
	};
	const unknown = { ...request, addedAt: undefined };
	assert.ok(compareRequests(newer, older, "recent") < 0);
	assert.ok(compareRequests(newer, older, "oldest") > 0);
	for (const sort of ["recent", "oldest"])
		assert.ok(compareRequests(unknown, newer, sort) > 0);
	assert.ok(
		compareRequests(
			{ ...request, name: "Alpha" },
			{ ...request, name: "Zebra" },
			"name",
		) < 0,
	);
});

test("search ranks title matches first and uses selected sorting for equal relevance", () => {
	const title = { ...request, name: "Brush", addedAt: "2026-09-01T00:00:00Z" };
	const phrase = { ...request, name: "Brush Studio" };
	const description = { ...request, name: "Alpha", reason: "Brush workflows" };
	for (const sort of ["recent", "oldest", "name"]) {
		assert.ok(compareRequests(title, phrase, sort, " brush ") < 0);
		assert.ok(compareRequests(phrase, description, sort, "brush") < 0);
	}
	assert.ok(compareRequests(title, description, "recent", "") > 0);
	assert.ok(
		compareRequests(
			description,
			{ ...description, name: "Zebra" },
			"name",
			"brush",
		) < 0,
	);
	assert.ok(
		filterRequest(description, { ...defaultRequestFilters, q: "brush" }, now),
	);
});

test("catalog exposes vendors from nested request paths without changing original identities", async () => {
	const catalog = await loadCatalog();
	assert.equal(
		catalog.requests.find((item) => item.original === "logic-pro")?.vendor,
		"apple",
	);
	assert.equal(
		catalog.requests.find(
			(item) => item.original === "adobe-character-animator",
		)?.vendor,
		"adobe",
	);
});
