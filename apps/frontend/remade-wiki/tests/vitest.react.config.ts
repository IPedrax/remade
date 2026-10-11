import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
	root: fileURLToPath(new URL("../", import.meta.url)),

	plugins: [react()],
	test: {
		name: "react",
		include: ["tests/react/**/*.test.tsx"],
		globalSetup: ["tests/fixtures/setup.ts"],
		browser: {
			enabled: true,
			headless: true,
			provider: playwright(),
			instances: [{ browser: "chromium" }],
		},
	},
});
