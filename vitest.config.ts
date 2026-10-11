import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		name: "unit",
		environment: "node",
		include: ["tests/unit/**/*.test.ts"],
		hookTimeout: 15_000,
	},
});
