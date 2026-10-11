import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
export default defineConfig({
	site: "https://remade.wiki",
	output: "static",
	redirects: {
		"/projects/solvecraft": {
			destination: "/projects/solidcraft/",
			status: 302,
		},
	},
	integrations: [react(), sitemap()],
	vite: { plugins: [tailwindcss()] },
});
