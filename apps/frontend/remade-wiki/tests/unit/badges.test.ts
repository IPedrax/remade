import { describe, expect, it } from "vitest";
import { badgeSnippets, badgeUrl } from "../../src/lib/badges";

const projectUrl = new URL("/projects/solvecraft/", "https://remade.wiki").href;

describe("badge snippets", () => {
	it.each(["dark", "light", "classic"] as const)(
		"generates all %s formats",
		(variant) => {
			const image = badgeUrl(variant);
			const snippets = badgeSnippets(projectUrl, variant);
			const width = variant === "classic" ? 115 : 127;

			expect(snippets.markdown).toBe(
				`[![Listed on Remade](${image})](${projectUrl})`,
			);

			expect(snippets.html).toBe(
				`<a href="${projectUrl}">\n  <img src="${image}" alt="Listed on Remade" width="${width}" height="20">\n</a>`,
			);

			expect(snippets.bbcode).toBe(
				`[url=${projectUrl}][img]${image}[/img][/url]`,
			);
		},
	);

	it("uses the supplied canonical listing instead of a fixed project", () => {
		const canonical = new URL("/projects/plane/", "https://remade.wiki").href;

		for (const snippet of Object.values(badgeSnippets(canonical))) {
			expect(snippet).toContain(canonical);
			expect(snippet).not.toContain("solvecraft");
		}
	});

	it("escapes generated HTML attributes", () => {
		const url = `https://remade.wiki/projects/example/?a=1&b="<tag>'`;

		expect(badgeSnippets(url).html).toContain(
			'href="https://remade.wiki/projects/example/?a=1&amp;b=&quot;&lt;tag&gt;&#39;"',
		);
	});

	it("defaults to the existing dark asset", () => {
		expect(badgeUrl()).toBe("https://remade.wiki/badges/listed-on-remade.svg");

		expect(badgeUrl("light")).toBe(
			"https://remade.wiki/badges/listed-on-remade-light.svg",
		);

		expect(badgeUrl("classic")).toBe(
			"https://remade.wiki/badges/listed-on-remade-classic.svg",
		);
	});
});
