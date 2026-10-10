import type { CatalogData, Metadata } from "../../lib/catalog";
import { categories } from "../../lib/constants";
import {
	contributeUrl,
	findBySlug,
	label,
	metadataFor,
	recent,
	repositoryUrl,
} from "../../lib/presentation";
import EntryCard from "../EntryCard";
import RequestCard from "../RequestCard";
import Search from "../Search";

interface Props {
	catalog: CatalogData;
	metadata: Record<string, Metadata>;
}
export default function Home({ catalog, metadata }: Props) {
	const featured = catalog.featured.map((slug) =>
		findBySlug(catalog.entries, slug),
	);
	return (
		<>
			<div className="max-w-[780px] pb-10 pt-14 sm:pt-[90px] [&_h1]:text-[clamp(2.4rem,6vw,4.8rem)] [&_p]:text-lg">
				<p className="mb-5 text-xs font-bold uppercase tracking-wide text-lime">
					A community-maintained software directory
				</p>
				<h1>
					Everything can
					<br />
					be remade<span className="text-lime">.</span>
				</h1>
				<p>Discover independently developed software reimplementations</p>
			</div>
			<Search />
			<section aria-labelledby="featured-heading">
				<div className="mb-6 flex flex-wrap items-baseline justify-between gap-4 [&_h2]:mb-0">
					<h2 id="featured-heading">Featured</h2>
					<span className="text-sm text-[#B2BEC9]">Selected by Remade</span>
				</div>
				{featured.length ? (
					<div className="grid grid-cols-1 gap-[18px] min-[900px]:grid-cols-[1.1fr_1fr] [&>article]:border-t-3 [&>article]:border-t-lime [&>article]:bg-panel [&>article]:p-6 sm:[&>article]:p-9 [&>article_h3]:text-[2rem]">
						<EntryCard
							entry={featured[0]}
							key={featured[0].slug}
							metadata={metadataFor(featured[0], metadata)}
							originals={catalog.originals}
						/>
						<div className="grid grid-cols-1 gap-[18px] min-[600px]:grid-cols-2">
							{featured.slice(1).map((entry) => (
								<EntryCard
									entry={entry}
									key={entry.slug}
									metadata={metadataFor(entry, metadata)}
									originals={catalog.originals}
								/>
							))}
						</div>
					</div>
				) : (
					<p className="rounded-xl border border-dashed border-line p-8">
						Featured selections are coming soon.{" "}
						<a href="/explore/">Explore the directory.</a>
					</p>
				)}
			</section>
			<section>
				<div className="mb-6 flex flex-wrap items-baseline justify-between gap-4 [&_h2]:mb-0">
					<h2>Browse by category</h2>
					<a className="text-sm text-lime hover:underline" href="/explore/">
						Explore all →
					</a>
				</div>
				<div className="grid grid-cols-1 gap-[18px] min-[600px]:grid-cols-2 min-[900px]:grid-cols-3">
					{categories.map((category) => (
						<a
							className="flex justify-between gap-3 rounded-lg border border-line p-5 hover:border-lime/50"
							href={`/explore/?category=${category}`}
							key={category}
						>
							<span>{label(category)}</span>
							<span className="text-lime">
								{catalog.projects.filter((p) => p.category === category).length}{" "}
								→
							</span>
						</a>
					))}
					<a
						className="flex justify-between gap-3 rounded-lg border border-line p-5 hover:border-lime/50"
						href="/explore/?category=tools"
					>
						<span>Supporting tools</span>
						<span className="text-lime">{catalog.tools.length} →</span>
					</a>
				</div>
			</section>
			<section>
				<div className="mb-6 flex flex-wrap items-baseline justify-between gap-4 [&_h2]:mb-0">
					<h2>Recently added</h2>
					<a className="text-sm text-lime hover:underline" href="/explore/">
						View all →
					</a>
				</div>
				<div className="grid grid-cols-1 gap-[18px] min-[600px]:grid-cols-2 min-[900px]:grid-cols-3">
					{recent(catalog.entries)
						.slice(0, 6)
						.map((entry) => (
							<EntryCard
								entry={entry}
								key={entry.slug}
								metadata={metadataFor(entry, metadata)}
								originals={catalog.originals}
							/>
						))}
				</div>
				<div className="mt-4 flex flex-wrap items-center justify-between gap-4">
					<p className="mb-0 text-xs text-muted">
						Ordered by catalog additions recorded in Git; tools are labeled
						separately.
					</p>
					<a
						className="inline-flex items-center rounded-lg border border-line px-3 py-2 text-xs font-semibold hover:border-lime hover:text-lime"
						href={contributeUrl}
					>
						Add a project
					</a>
				</div>
			</section>
			<section>
				<div className="mb-6 flex flex-wrap items-baseline justify-between gap-4 [&_h2]:mb-0">
					<h2>Project Requests</h2>
					<a className="text-sm text-lime hover:underline" href="/requests/">
						View all requests →
					</a>
				</div>
				{catalog.requests.length ? (
					<div className="grid grid-cols-1 gap-[18px] min-[600px]:grid-cols-2 min-[900px]:grid-cols-3">
						{catalog.requests.slice(0, 3).map((request) => (
							<RequestCard
								key={request.original}
								original={findBySlug(catalog.originals, request.original)}
								request={request}
							/>
						))}
					</div>
				) : (
					<p className="rounded-xl border border-dashed border-line p-8">
						No open requests.{" "}
						<a href="/requests/">Suggest a software target.</a>
					</p>
				)}
				<div className="mt-6">
					<p className="text-xs text-muted">
						Software the community would like to see remade. These are wishes,
						not existing implementations.
					</p>
					<div className="flex flex-wrap items-center gap-4">
						<p className="mb-0 text-sm text-muted">Step up to the plate?</p>
						<a
							className="inline-flex items-center rounded-lg border border-line px-3 py-2 text-xs font-semibold hover:border-lime hover:text-lime"
							href={`${repositoryUrl}/issues/new?template=project-request.yml`}
						>
							Submit Request
						</a>
					</div>
				</div>
			</section>
		</>
	);
}
