import type { Suite, ToolSource } from "./schemas";

export function supportedProjectSlugs(
	tool: Pick<ToolSource, "projects" | "suites">,
	suites: readonly Suite[],
): string[] {
	return [
		...new Set([
			...(tool.projects ?? []),
			...(tool.suites ?? []).flatMap((slug) => {
				const suite = suites.find((entry) => entry.slug === slug);

				if (!suite) throw new Error(`Unknown tool suite: ${slug}`);

				return suite.projects;
			}),
		]),
	];
}

export function toolTargets(
	tool: Pick<ToolSource, "projects" | "suites">,
	suites: readonly Suite[],
) {
	const groups = (tool.suites ?? []).map((slug) => {
		const suite = suites.find((entry) => entry.slug === slug);

		if (!suite) throw new Error(`Unknown tool suite: ${slug}`);

		return suite;
	});
	const grouped = new Set(groups.flatMap((suite) => suite.projects));

	return {
		suites: groups,
		projects: (tool.projects ?? []).filter((slug) => !grouped.has(slug)),
	};
}
