import { findBySlug } from "../../lib/presentation";
import type { Project, Suite, Tool } from "../../lib/schemas";
import { toolTargets } from "../../lib/suites";

interface Props {
	tool: Tool;
	projects: Project[];
	suites: Suite[];
}

export default function ToolTargets({ tool, projects, suites }: Props) {
	const targets = toolTargets(tool, suites);
	const links = [
		...targets.suites.map((suite) => ({
			name: suite.name,
			href: `/suites/${suite.slug}/`,
		})),
		...targets.projects.map((slug) => ({
			name: findBySlug(projects, slug).name,
			href: `/projects/${slug}/`,
		})),
	];

	return links.map((link, index) => (
		<span key={link.href}>
			{index > 0 && ", "}
			<a className="relative z-10 text-lime hover:underline" href={link.href}>
				{link.name}
			</a>
		</span>
	));
}
