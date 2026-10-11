import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
	root: fileURLToPath(new URL("../", import.meta.url)),
	test: {
		name: "auth",
		include: ["tests/auth/**/*.test.ts"],
		globalSetup: ["tests/auth/setup.ts"],
		testTimeout: 15_000,
		hookTimeout: 30_000,
		fileParallelism: false,
	},
});
