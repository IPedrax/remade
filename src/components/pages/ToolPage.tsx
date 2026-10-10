import type { CatalogData, Metadata } from "../../lib/catalog";
import { findBySlug, metadataFor } from "../../lib/presentation";
import type { Tool } from "../../lib/schemas";
import Authors from "../Authors";
import EntryCard from "../EntryCard";
import Stats from "../Stats";

interface Props {
	tool: Tool;
	catalog: CatalogData;
	metadata: Record<string, Metadata>;
}
export default function ToolPage({ tool, catalog, metadata }: Props) {
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
				</div>
				<p className="mt-6">
					Platforms: {tool.platforms?.join(", ") || "Not documented"}
				</p>
				<Authors authors={tool.authors} />
			</div>
			<section>
				<h2>Works with</h2>
				<p>
					This tool adds functionality to these projects. Tools do not count as
					reimplementations or fulfill requests.
				</p>
				<div className="grid grid-cols-1 gap-[18px] min-[600px]:grid-cols-2 min-[900px]:grid-cols-3">
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
							/>
						))}
				</div>
			</section>
			<Stats metadata={metadataFor(entry, metadata)} />
		</>
	);
}
