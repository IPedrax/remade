import { Fragment } from "react";
import type { Original, Project } from "../lib/schemas";

export default function OriginalLinks({
	project,
	originals,
	className = "text-lime hover:underline",
}: {
	project: Project;
	originals: Original[];
	className?: string;
}) {
	return project.originals.map((slug, index) => {
		const original = originals.find((o) => o.slug === slug);
		if (!original) throw new Error(`Missing original: ${slug}`);
		return (
			<Fragment key={slug}>
				{index > 0 && ", "}
				<a className={className} href={`/software/${slug}/`}>
					{original.name}
				</a>
			</Fragment>
		);
	});
}
