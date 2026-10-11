import type { TestProject } from "vitest/node";
import { loadCatalog } from "../../src/lib/catalog";

export default async function setup({ provide }: TestProject) {
	provide("catalog", await loadCatalog());
}
