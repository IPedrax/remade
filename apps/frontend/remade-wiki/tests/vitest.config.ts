import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
	root: fileURLToPath(new URL("../", import.meta.url)),

	test: {
		name: "unit",
		environment: "node",
		include: ["tests/unit/**/*.test.ts"],
		hookTimeout: 15_000,
	},
});
