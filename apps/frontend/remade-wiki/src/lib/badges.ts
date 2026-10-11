export type BadgeVariant = "dark" | "light" | "classic";
export type BadgeFormat = "markdown" | "html" | "bbcode";

export function badgePath(variant: BadgeVariant = "dark"): string {
	return `/badges/listed-on-remade${variant === "dark" ? "" : `-${variant}`}.svg`;
}

export function badgeUrl(variant: BadgeVariant = "dark"): string {
	return new URL(badgePath(variant), "https://remade.wiki").href;
}

function escapeAttribute(value: string): string {
	return value.replace(/[&<>"']/g, (character) => {
		const entities: Record<string, string> = {
			"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			'"': "&quot;",
			"'": "&#39;",
		};

		return entities[character];
	});
}

export function badgeSnippets(
	projectUrl: string,
	variant: BadgeVariant = "dark",
): Record<BadgeFormat, string> {
	const image = badgeUrl(variant);
	const width = variant === "classic" ? 115 : 127;

	return {
		markdown: `[![Listed on Remade](${image})](${projectUrl})`,
		html: `<a href="${escapeAttribute(projectUrl)}">\n  <img src="${image}" alt="Listed on Remade" width="${width}" height="20">\n</a>`,
		bbcode: `[url=${projectUrl}][img]${image}[/img][/url]`,
	};
}
