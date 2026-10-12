import { describe, expect, it } from "vitest";
import {
	catalogAddedAt,
	parseAdditionDates,
} from "../../src/lib/catalog-history";

describe("catalog addition history", () => {
	it("preserves earliest dates across folder and monorepo moves", () => {
		const dates = parseAdditionDates(
			[
				"\0 2026-10-11T10:00:00-07:00",
				"apps/frontend/remade-wiki/src/content/catalog/projects/author/example.yaml",
				"\0 2026-09-01T10:00:00-07:00",
				"src/content/catalog/projects/example.yaml",
				"src/content/catalog/requests/vendor/request.yaml",
				"src/content/catalog/originals.yaml",
			].join("\n"),
		);

		expect(catalogAddedAt(dates, "projects", "example")).toBe(
			"2026-09-01T10:00:00-07:00",
		);
		expect(catalogAddedAt(dates, "requests", "request")).toBe(
			"2026-09-01T10:00:00-07:00",
		);
		expect(dates.size).toBe(2);
	});

	it("uses redirected project slugs and keeps tools separate", () => {
		const dates = new Map([
			["projects/solidcraft", "2026-10-11T10:00:00Z"],
			["projects/solvecraft", "2026-09-01T10:00:00Z"],
			["tools/solidcraft", "2026-08-01T10:00:00Z"],
		]);

		expect(
			catalogAddedAt(dates, "projects", "solidcraft", ["solvecraft"]),
		).toBe("2026-09-01T10:00:00Z");
		expect(catalogAddedAt(dates, "projects", "uncommitted")).toBeUndefined();
	});

	it("handles empty or unavailable history", () => {
		expect(parseAdditionDates("").size).toBe(0);
	});
});
