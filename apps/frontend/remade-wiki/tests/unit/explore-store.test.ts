import { describe, expect, it } from "vitest";
import {
	createExploreStore,
	defaultFilters,
} from "../../src/stores/explore-store.ts";

describe("Explore state", () => {
	it("keeps separate page instances isolated", () => {
		const first = createExploreStore();
		const second = createExploreStore();

		first.getState().change("q", "Photoshop");

		expect(first.getState().filters.q).toBe("Photoshop");
		expect(second.getState().filters).toEqual(defaultFilters);
	});

	it("updates one filter without losing the others, then clears all filters", () => {
		const store = createExploreStore();
		store.getState().change("language", "Rust");
		store.getState().change("sort", "stars");

		expect(store.getState().filters.language).toBe("Rust");
		expect(store.getState().filters.sort).toBe("stars");

		store.getState().clear();

		expect(store.getState().filters).toEqual(defaultFilters);
	});

	it("replaces filters when restoring URL state", () => {
		const store = createExploreStore();
		store.getState().change("platform", "macOS");
		store.getState().setFilters({ ...defaultFilters, q: "CAD" });

		expect(store.getState().filters).toEqual({ ...defaultFilters, q: "CAD" });
	});
});
