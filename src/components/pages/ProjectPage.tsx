import type { CatalogData, Metadata } from "../../lib/catalog";
import {
	contributeUrl,
	findBySlug,
	label,
	metadataFor,
} from "../../lib/presentation";
import { type Project, projectOriginals } from "../../lib/schemas";
import Authors from "../Authors";
import EntryCard from "../EntryCard";
import OriginalLinks from "../OriginalLinks";
import Stats from "../Stats";

interface Props {
	project: Project;
	catalog: CatalogData;
	metadata: Record<string, Metadata>;
}
export default function ProjectPage({ project, catalog, metadata }: Props) {
	const original = findBySlug(catalog.originals, project.original);
	const entry = findBySlug(catalog.entries, project.slug);
	const related = catalog.entries.filter(
		(e) =>
			e.kind === "project" &&
			projectOriginals(e).some((slug) =>
				projectOriginals(project).includes(slug),
			) &&
			e.slug !== project.slug,
	);
	const tools = catalog.entries.filter(
		(e) => e.kind === "tool" && e.projects.includes(project.slug),
	);
	return (
		<>
			<div className="max-w-[860px] pt-16">
				<p className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-lime">
					Reimplementation · {label(project.category)}
				</p>
				<h1 data-pagefind-meta="title">{project.name}</h1>
				<p>
					Reimplements{" "}
					<OriginalLinks
						className="text-sm text-lime hover:underline"
						originals={catalog.originals}
						project={project}
					/>
				</p>
				<p>{project.description}</p>
				<div className="flex flex-wrap items-center gap-6">
					<a
						className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-lime bg-lime px-4 py-3 text-sm font-semibold text-canvas hover:bg-lime-light hover:text-canvas"
						href={project.repository}
					>
						Source repository ↗
					</a>
					{project.website && (
						<a
							className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-line px-4 py-3 text-sm font-semibold text-ink hover:border-lime hover:text-lime"
							href={project.website}
							rel="noopener noreferrer"
							target="_blank"
						>
							Official website ↗
						</a>
					)}
					{project.docs && (
						<a
							className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-line px-4 py-3 text-sm font-semibold text-ink hover:border-lime hover:text-lime"
							href={project.docs}
						>
							Documentation ↗
						</a>
					)}
				</div>
				<div className="mt-6">
					<p className="mb-2 text-base">Repository Mirrors</p>
					{project.mirrors?.length ? (
						<details className="mb-6">
							<summary className="w-fit cursor-pointer text-sm text-lime hover:underline">
								<span className="ml-1">View Mirrors</span>
							</summary>
							<div className="mt-3">
								<ul className="flex flex-wrap list-none gap-4 rounded-lg border border-line p-4">
									{project.mirrors.map((mirror) => (
										<li key={mirror}>
											<a
												className="break-all text-sm text-lime hover:underline"
												href={mirror}
												rel="noopener noreferrer"
												target="_blank"
											>
												{new URL(mirror).host + new URL(mirror).pathname} ↗
											</a>
										</li>
									))}
								</ul>
							</div>
						</details>
					) : (
						<p className="mb-6 text-sm text-muted">
							No mirrors found.{" "}
							<a
								className="text-lime hover:underline"
								href={contributeUrl}
								rel="noopener noreferrer"
								target="_blank"
							>
								Contribute a mirror link ↗
							</a>
						</p>
					)}
					<Authors authors={project.authors} />
				</div>
			</div>
			<section className="max-w-[780px]">
				<h2>Compatibility and scope</h2>
				<p className="border-l-2 border-lime bg-surface px-5 py-4">
					Status and compatibility are maintainer-reported. Inclusion is not an
					independent verification or certification.
				</p>
				<dl className="grid grid-cols-1 gap-4 min-[600px]:grid-cols-2 [&>div]:border-b [&>div]:border-line [&>div]:py-3">
					<div>
						<dt>Development status</dt>
						<dd>{label(project.status)}</dd>
					</div>
					<div>
						<dt>Compatibility</dt>
						<dd>{label(project.compatibility)} (claimed)</dd>
					</div>
					<div>
						<dt>Languages</dt>
						<dd>{project.languages.join(", ")}</dd>
					</div>
					<div>
						<dt>Platforms</dt>
						<dd>{project.platforms?.join(", ") || "Not documented"}</dd>
					</div>
					<div>
						<dt>License</dt>
						<dd>{project.license}</dd>
					</div>
				</dl>
				<h3 className="mt-8">Known limitations</h3>
				<p>
					{project.limitations ??
						"No specific limitations recorded. Consult the source repository for current coverage."}
				</p>
			</section>
			<Stats metadata={metadataFor(entry, metadata)} />
			{tools.length > 0 && (
				<section>
					<h2>Supporting tools</h2>
					<div className="grid auto-rows-fr grid-cols-1 gap-[18px] min-[600px]:grid-cols-2 min-[900px]:grid-cols-3">
						{tools.map((entry) => (
							<EntryCard
								entry={entry}
								key={entry.slug}
								metadata={metadataFor(entry, metadata)}
								originals={catalog.originals}
							/>
						))}
					</div>
				</section>
			)}
			{related.length > 0 && (
				<section>
					<h2>
						{project.additional_originals?.length
							? "More implementations of these targets"
							: `More implementations of ${original.name}`}
					</h2>
					<div className="grid auto-rows-fr grid-cols-1 gap-[18px] min-[600px]:grid-cols-2 min-[900px]:grid-cols-3">
						{related.map((entry) => (
							<EntryCard
								entry={entry}
								key={entry.slug}
								metadata={metadataFor(entry, metadata)}
								originals={catalog.originals}
							/>
						))}
					</div>
				</section>
			)}
		</>
	);
}
