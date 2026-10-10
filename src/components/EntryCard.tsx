import {
	type Entry,
	entryUrl,
	label,
	type Metadata,
} from "../lib/presentation";
import type { Original } from "../lib/schemas";
import Authors from "./Authors";

interface Props {
	entry: Entry;
	originals: Original[];
	metadata?: Metadata;
}
export default function EntryCard({ entry, originals, metadata }: Props) {
	const original =
		entry.kind === "project"
			? originals.find((o) => o.slug === entry.original)
			: undefined;
	return (
		<article className="flex min-w-0 flex-col rounded-xl border border-line bg-surface p-[22px] text-sm hover:border-lime/50 sm:p-[26px]">
			<div className="mb-3.5 flex flex-wrap gap-2">
				<span className="rounded border border-line bg-panel px-2 py-0.5 text-xs text-muted">
					{entry.kind === "tool" ? "Tool" : label(entry.status)}
				</span>
				{entry.kind === "project" && (
					<span className="rounded border border-line bg-panel px-2 py-0.5 text-xs text-muted">
						{entry.languages.join(" · ")}
					</span>
				)}
				{metadata && (
					<span
						className="rounded border border-line bg-panel px-2 py-0.5 text-xs text-muted"
						title={`Last successful update: ${metadata.fetchedAt}`}
					>
						★ {metadata.stars.toLocaleString()}
					</span>
				)}
			</div>
			<h3>
				<a href={entryUrl(entry)}>{entry.name} ↗</a>
			</h3>
			<p className="mb-3.5 text-xs">
				{original ? (
					<>
						Reimplements{" "}
						<a className="text-lime" href={`/software/${original.slug}/`}>
							{original.name}
						</a>
					</>
				) : (
					"Adds on to indexed projects"
				)}
			</p>
			<p>{entry.description}</p>
			<Authors authors={entry.authors} />
		</article>
	);
}
