import { defineCollection } from "astro:content";
import { loadCatalog } from "./lib/catalog";

// Valibot validation happens inside the loaders, including cross-file rules.
export const collections = {
	suites: defineCollection({
		loader: async () =>
			(await loadCatalog()).suites.map((data) => ({ id: data.slug, ...data })),
	}),
	projects: defineCollection({
		loader: async () =>
			(await loadCatalog()).projects.map((data) => ({
				id: data.slug,
				...data,
			})),
	}),
	tools: defineCollection({
		loader: async () =>
			(await loadCatalog()).tools.map((data) => ({ id: data.slug, ...data })),
	}),
	requests: defineCollection({
		loader: async () =>
			(await loadCatalog()).requests.map((data) => ({
				id: data.original,
				...data,
			})),
	}),
};
