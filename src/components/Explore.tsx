import { useEffect, useMemo, useState } from "react";
import { type BrowseEntry, compareEntries, filterEntries } from "../lib/browse";
import type { CatalogData, Entry, Metadata } from "../lib/catalog";
import { categories, compatibility, statuses } from "../lib/constants";
import { contributeUrl, label, metadataFor, recent } from "../lib/presentation";
import {
	compareRequests,
	defaultRequestFilters,
	filterRequest,
} from "../lib/request-browse";
import EntryCard from "./EntryCard";
import RequestCard from "./RequestCard";
import { SearchField } from "./Search";
import SiteSearchResults from "./SiteSearchResults";

interface Props {
	catalog: CatalogData;
	metadata: Record<string, Metadata>;
}
interface Filters {
	q: string;
	category: string;
	language: string;
	platform: string;
	status: string;
	compatibility: string;
	sort: string;
}
const defaultFilters: Filters = {
	q: "",
	category: "",
	language: "",
	platform: "",
	status: "",
	compatibility: "",
	sort: "recent",
};
const fields = [
	"q",
	"category",
	"language",
	"platform",
	"status",
	"compatibility",
	"sort",
] as const;

function browseData(
	entry: Entry,
	catalog: CatalogData,
	metadata: Record<string, Metadata>,
): BrowseEntry {
	const originals =
		entry.kind === "project"
			? catalog.originals.filter((o) => entry.originals.includes(o.slug))
			: [];
	return {
		name: entry.name,
		search: [
			entry.name,
			entry.description,
			...originals.flatMap((o) => [o.name, ...(o.aliases ?? [])]),
			...(entry.authors ?? []),
			...(entry.kind === "project" ? entry.languages : []),
		]
			.filter(Boolean)
			.join(" "),
		category: entry.kind === "project" ? entry.category : "tools",
		languages: entry.kind === "project" ? entry.languages : [],
		platforms: entry.platforms ?? [],
		status: entry.kind === "project" ? entry.status : "",
		compatibility: entry.kind === "project" ? entry.compatibility : "",
		addedAt: entry.addedAt ?? "",
		stars: metadataFor(entry, metadata)?.stars ?? null,
	};
}

export default function Explore({ catalog, metadata }: Props) {
	const [filters, setFilters] = useState<Filters>(defaultFilters);
	const [ready, setReady] = useState(false);
	useEffect(() => {
		const readUrl = () => {
			const params = new URLSearchParams(location.search);
			const next = { ...defaultFilters };
			for (const key of fields)
				next[key] = params.get(key) ?? defaultFilters[key];
			setFilters(next);
			setReady(true);
		};
		readUrl();
		window.addEventListener("popstate", readUrl);
		return () => window.removeEventListener("popstate", readUrl);
	}, []);
	useEffect(() => {
		if (!ready) return;
		const params = new URLSearchParams();
		for (const key of fields)
			if (filters[key] && filters[key] !== defaultFilters[key])
				params.set(key, filters[key]);
		history.replaceState(
			null,
			"",
			`${location.pathname}${params.size ? `?${params}` : ""}`,
		);
	}, [filters, ready]);
	const languages = useMemo(
		() => [...new Set(catalog.projects.flatMap((p) => p.languages))].sort(),
		[catalog],
	);
	const platforms = useMemo(
		() =>
			[...new Set(catalog.entries.flatMap((p) => p.platforms ?? []))].sort(),
		[catalog],
	);
	const entries = useMemo(
		() =>
			recent(catalog.entries)
				.filter((entry) =>
					filterEntries(browseData(entry, catalog, metadata), { ...filters }),
				)
				.sort((a, b) =>
					compareEntries(
						browseData(a, catalog, metadata),
						browseData(b, catalog, metadata),
						filters.sort,
					),
				),
		[catalog, metadata, filters],
	);
	const matchingRequests = useMemo(() => {
		if (entries.length || !filters.q.trim()) return [];
		return catalog.requests
			.map((request) => {
				const original = catalog.originals.find(
					(item) => item.slug === request.original,
				);
				if (!original) return undefined;
				return {
					request,
					original: request.original,
					target: original,
					name: original.name,
					category: original.category,
					vendor: request.vendor,
					addedAt: request.addedAt,
					aliases: original.aliases,
					suggestedNames: request.suggested_names,
					reason: request.reason,
				};
			})
			.filter((request) => request !== undefined)
			.filter((request) =>
				filterRequest(
					request,
					{ ...defaultRequestFilters, q: filters.q },
					new Date(),
				),
			)
			.sort((a, b) => compareRequests(a, b, "recent", filters.q));
	}, [catalog, entries.length, filters.q]);
	const change = (key: keyof Filters, value: string) =>
		setFilters((previous) => ({ ...previous, [key]: value }));
	const select = (
		key: Exclude<keyof Filters, "q" | "sort">,
		title: string,
		options: readonly string[],
	) => (
		<label className="min-w-0 text-xs">
			{title}
			<span className="relative mt-1.5 block">
				<select
					className="mt-0 w-full appearance-none bg-canvas py-2 pl-3 pr-10 text-sm"
					name={key}
					onChange={(event) => change(key, event.target.value)}
					value={filters[key]}
				>
					<option value="">
						{
							{
								category: "All categories",
								language: "All languages",
								platform: "All platforms",
								status: "All statuses",
								compatibility: "All targets",
							}[key]
						}
					</option>
					{options.map((value) => (
						<option key={value} value={value}>
							{["category", "status", "compatibility"].includes(key)
								? label(value)
								: value}
						</option>
					))}
				</select>
				<svg
					aria-hidden="true"
					className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-ink"
					fill="none"
					stroke="currentColor"
					strokeWidth="1.5"
					viewBox="0 0 24 24"
				>
					<path d="m6 9 6 6 6-6" />
				</svg>
			</span>
		</label>
	);
	return (
		<>
			<div className="max-w-[860px] pt-16">
				<p className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-lime">
					The directory
				</p>
				<h1>Find what’s been remade.</h1>
				<p>
					{catalog.projects.length} reimplementations and {catalog.tools.length}{" "}
					supporting tools. Browse by the software you know or the technology
					you use.
				</p>
			</div>
			<search className="my-8 border-b border-line pb-6">
				<form onSubmit={(event) => event.preventDefault()}>
					<div className="max-w-[640px]">
						<SearchField
							onChange={(value) => change("q", value)}
							value={filters.q}
						/>
					</div>
					<div className="mt-5 grid grid-cols-1 items-end gap-3 min-[600px]:grid-cols-3">
						{select("category", "Category", [...categories, "tools"])}
						{select("language", "Language", languages)}
						{select("platform", "Platform", platforms)}
					</div>
					<div className="mt-4 flex items-start justify-between gap-4">
						<details
							className="min-w-0 flex-1"
							open={
								Boolean(filters.status || filters.compatibility) || undefined
							}
						>
							<summary className="w-fit cursor-pointer text-sm text-muted hover:text-lime">
								More filters
							</summary>
							<div className="mt-4 grid max-w-[640px] grid-cols-1 gap-3 min-[600px]:grid-cols-2">
								{select("status", "Status", statuses)}
								{select("compatibility", "Compatibility", compatibility)}
							</div>
							<p className="mb-0 mt-2 text-xs">
								Status and compatibility are maintainer-reported.
							</p>
						</details>
						<button
							className="shrink-0 text-sm text-muted hover:text-lime"
							onClick={() => setFilters({ ...defaultFilters })}
							type="button"
						>
							Clear filters
						</button>
					</div>
				</form>
			</search>
			<noscript>
				<p>
					All entries are listed below. Enable JavaScript for filtering,
					sorting, and indexed search.
				</p>
			</noscript>
			<div className="mb-5 flex flex-wrap items-center justify-between gap-3">
				<p aria-live="polite" className="mb-0 text-sm" role="status">
					{entries.length} {entries.length === 1 ? "entry" : "entries"}
				</p>
				<label className="flex items-center gap-2 text-xs">
					Sort by
					<span className="relative block">
						<select
							className="mt-0 w-auto appearance-none border-0 bg-transparent py-1 pl-2 pr-8 text-sm text-ink"
							name="sort"
							onChange={(event) => change("sort", event.target.value)}
							value={filters.sort}
						>
							<option value="recent">Recently added</option>
							<option value="name">Alphabetical</option>
							<option value="stars">GitHub stars</option>
						</select>
						<svg
							aria-hidden="true"
							className="pointer-events-none absolute right-2 top-1/2 size-4 -translate-y-1/2 text-ink"
							fill="none"
							stroke="currentColor"
							strokeWidth="1.5"
							viewBox="0 0 24 24"
						>
							<path d="m6 9 6 6 6-6" />
						</svg>
					</span>
				</label>
			</div>
			<div className="grid auto-rows-fr grid-cols-1 gap-[18px] min-[600px]:grid-cols-2 min-[900px]:grid-cols-3">
				{entries.map((entry) => (
					<EntryCard
						entry={entry}
						key={entry.slug}
						metadata={metadataFor(entry, metadata)}
						originals={catalog.originals}
					/>
				))}
			</div>
			{entries.length === 0 && (
				<div className="rounded-xl border border-dashed border-line p-8">
					<h2>No matching entries</h2>
					<p>
						Try another search, clear the filters, or{" "}
						<a className="text-lime hover:underline" href={contributeUrl}>
							contribute a project
						</a>
						.
					</p>
					<button
						className="rounded-lg border border-line px-4 py-3 text-sm font-semibold hover:border-lime"
						onClick={() => setFilters({ ...defaultFilters })}
						type="button"
					>
						Clear filters
					</button>
				</div>
			)}
			{matchingRequests.length > 0 && (
				<section aria-labelledby="matching-requests" className="mt-8">
					<h2 id="matching-requests">Matching Project Requests</h2>
					<p>
						Your search matches these community requests. These are wishes, not
						existing implementations.
					</p>
					<div className="grid auto-rows-fr grid-cols-1 gap-[18px] min-[600px]:grid-cols-2 min-[900px]:grid-cols-3">
						{matchingRequests.map(({ request, target }) => (
							<RequestCard
								key={request.original}
								original={target}
								request={request}
							/>
						))}
					</div>
					<a
						className="mt-4 inline-block text-sm text-lime hover:underline"
						href={`/requests/?${new URLSearchParams({ q: filters.q })}`}
					>
						Search Project Requests →
					</a>
				</section>
			)}
			<SiteSearchResults query={filters.q} />
			<div className="mt-8 flex flex-wrap items-center justify-between gap-4">
				<p className="mb-0 text-xs text-muted">
					GitHub statistics are refreshed approximately every 24 hours. Unknown
					counts sort after available counts.
				</p>
				<a
					className="inline-flex items-center rounded-lg border border-line px-3 py-2 text-xs font-semibold hover:border-lime hover:text-lime"
					href={contributeUrl}
				>
					Add a project
				</a>
			</div>
		</>
	);
}
