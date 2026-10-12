import type { ReactNode } from "react";
import type { Entry, Metadata } from "../../lib/catalog";
import {
	formatStars,
	label,
	metadataFor,
	relativeDate,
	shortDate,
} from "../../lib/presentation";

type ProjectEntry = Extract<Entry, { kind: "project" }>;

interface Props {
	projects: ProjectEntry[];
	metadata: Record<string, Metadata>;
	originalName: string;
}

export default function ProjectComparison({
	projects,
	metadata,
	originalName,
}: Props) {
	if (projects.length < 2) return null;

	const timestamp = (value?: string) =>
		value ? (
			<time dateTime={value} title={shortDate(value)}>
				{relativeDate(value)}
			</time>
		) : (
			"Unavailable"
		);
	const rows: { name: string; value: (project: ProjectEntry) => ReactNode }[] =
		[
			{
				name: "Languages",
				value: (p) => p.languages.join(", "),
			},
			{
				name: "Platforms",
				value: (p) =>
					p.platforms?.length ? p.platforms.join(", ") : "Not documented",
			},
			{ name: "Compatibility", value: (p) => label(p.compatibility) },
			{ name: "Maturity", value: (p) => label(p.status) },
			{ name: "License", value: (p) => p.license },
			{ name: "Scope", value: (p) => p.description },
			{ name: "Limitations", value: (p) => p.limitations ?? "Not documented" },
			{
				name: "Last repository push",
				value: (p) =>
					timestamp(metadataFor(p, metadata)?.pushedAt ?? undefined),
			},
			{
				name: "Repository state",
				value: (p) => {
					const stats = metadataFor(p, metadata);

					return stats
						? stats.isArchived
							? "Archived"
							: "Not archived"
						: "Unavailable";
				},
			},
			{
				name: "GitHub stars",
				value: (p) => {
					const stats = metadataFor(p, metadata);

					return stats ? (
						<span title={stats.stars.toLocaleString("en")}>
							{formatStars(stats.stars)}
						</span>
					) : (
						"Unavailable"
					);
				},
			},
			{
				name: "Statistics updated",
				value: (p) => timestamp(metadataFor(p, metadata)?.fetchedAt),
			},
		];

	return (
		<details className="group mb-6">
			<summary className="absolute right-0 top-0 inline-flex cursor-pointer list-none items-center gap-3 rounded-lg border border-lime bg-lime px-5 py-3 text-base font-semibold text-canvas hover:bg-lime-light [&::-webkit-details-marker]:hidden">
				Compare
				<svg
					aria-hidden="true"
					className="size-4 group-open:rotate-180"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					viewBox="0 0 24 24"
				>
					<path d="m6 9 6 6 6-6" />
				</svg>
			</summary>

			<p className="text-sm">
				Compatibility, maturity and platform support are maintainer-reported.
				Activity uses cached GitHub statistics, refreshed approximately every 24
				hours.
			</p>

			<section
				aria-label={`Comparison of ${originalName} implementations`}
				className="mt-0 overflow-x-auto rounded-xl border border-line focus-visible:outline-lime"
				// biome-ignore lint/a11y/noNoninteractiveTabindex: Allow keyboard scrolling of the wide comparison table.
				tabIndex={0}
			>
				<table className="w-full border-collapse text-left text-sm">
					<caption className="sr-only">
						Compare implementations of {originalName}
					</caption>

					<thead className="bg-panel">
						<tr>
							<th className="min-w-[170px] p-4" scope="col">
								Feature
							</th>

							{projects.map((p) => (
								<th
									className="min-w-[260px] p-4 text-base"
									key={p.slug}
									scope="col"
								>
									<a
										className="text-lime hover:underline"
										href={`/projects/${p.slug}/`}
									>
										{p.name} ↗
									</a>
								</th>
							))}
						</tr>
					</thead>

					<tbody>
						{rows.map((row) => (
							<tr className="border-t border-line bg-surface" key={row.name}>
								<th
									className="p-4 align-top font-medium text-muted"
									scope="row"
								>
									{row.name}
								</th>

								{projects.map((p) => (
									<td className="p-4 align-top" key={p.slug}>
										{row.value(p)}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</section>
		</details>
	);
}
