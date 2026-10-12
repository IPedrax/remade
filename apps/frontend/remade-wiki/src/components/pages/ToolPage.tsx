import type { ReactNode } from "react";
import type { CatalogData, Metadata } from "../../lib/catalog";
import {
	entryCategories,
	findBySlug,
	label,
	metadataFor,
} from "../../lib/presentation";
import type { Tool } from "../../lib/schemas";
import BadgeShareSection from "../badges/BadgeShareSection";
import Authors from "../catalog/Authors";
import EntryCard from "../catalog/EntryCard";
import RepositoryMirrors from "../catalog/RepositoryMirrors";
import Stats from "../catalog/Stats";

interface Props {
	tool: Tool;
	catalog: CatalogData;
	metadata: Record<string, Metadata>;
	children?: ReactNode;
}

export default function ToolPage({ tool, catalog, metadata, children }: Props) {
	const entry = findBySlug(catalog.entries, tool.slug);

	return (
		<>
			<div className="max-w-[860px] pt-16">
				<p className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-lime">
					Supporting tool
				</p>

				<h1 data-pagefind-meta="title">{tool.name}</h1>

				<p>{tool.description}</p>

				<div className="flex flex-wrap items-center gap-6">
					<a
						className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-lime bg-lime px-4 py-3 text-sm font-semibold text-canvas hover:bg-lime-light hover:text-canvas"
						href={tool.url}
					>
						Open tool ↗
					</a>

					<a
						className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-line px-4 py-3 text-sm font-semibold text-ink hover:border-lime hover:text-lime"
						href={tool.repository}
					>
						Source repository ↗
					</a>

					{tool.website && (
						<a
							className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-line px-4 py-3 text-sm font-semibold text-ink hover:border-lime hover:text-lime"
							href={tool.website}
							rel="noopener noreferrer"
							target="_blank"
						>
							Official website ↗
						</a>
					)}

					{tool.docs && (
						<a
							className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-line px-4 py-3 text-sm font-semibold text-ink hover:border-lime hover:text-lime"
							href={tool.docs}
							rel="noopener noreferrer"
							target="_blank"
						>
							Documentation ↗
						</a>
					)}
				</div>

				<div className="mt-6">
					<RepositoryMirrors mirrors={tool.mirrors} />

					<Authors authors={tool.authors} />
				</div>
			</div>

			<section>
				<h2>Works with</h2>

				<p>
					This tool adds functionality to these projects. Tools do not count as
					reimplementations or fulfill requests.
				</p>

				<div className="grid auto-rows-fr grid-cols-1 gap-[18px] min-[600px]:grid-cols-2 min-[900px]:grid-cols-3">
					{catalog.entries
						.filter(
							(e) => e.kind === "project" && tool.projects.includes(e.slug),
						)
						.map((entry) => (
							<EntryCard
								entry={entry}
								key={entry.slug}
								metadata={metadataFor(entry, metadata)}
								originals={catalog.originals}
								projects={catalog.projects}
							/>
						))}
				</div>
			</section>

			<section className="max-w-[780px]">
				<h2>Details and scope</h2>

				<p className="border-l-2 border-lime bg-surface px-5 py-4">
					Development status and scope are maintainer-reported. Inclusion is not
					an independent verification or certification.
				</p>

				<dl className="grid grid-cols-1 gap-4 min-[600px]:grid-cols-2 [&>div]:border-b [&>div]:border-line [&>div]:py-3">
					<div>
						<dt>Categories</dt>

						<dd>
							{entryCategories(entry, catalog.projects).map(label).join(", ")}
						</dd>
					</div>

					<div>
						<dt>Development status</dt>

						<dd>
							{tool.status
								? `${label(tool.status)} (maintainer-reported)`
								: "Not documented"}
						</dd>
					</div>

					<div>
						<dt>Languages</dt>

						<dd>{tool.languages.join(", ")}</dd>
					</div>

					<div>
						<dt>Platforms</dt>

						<dd>{tool.platforms?.join(", ") || "Not documented"}</dd>
					</div>

					<div>
						<dt>License</dt>

						<dd>{tool.license || "Not documented"}</dd>
					</div>
				</dl>

				<h3 className="mt-8">Known limitations</h3>

				<p>
					{tool.limitations ??
						"No specific limitations recorded. Consult the source repository for current coverage."}
				</p>
			</section>

			<Stats metadata={metadataFor(entry, metadata)} />

			<BadgeShareSection title="Share this tool">{children}</BadgeShareSection>
		</>
	);
}
