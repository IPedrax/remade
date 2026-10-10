import type { Entry, Metadata } from "./catalog";

export type { Entry, Metadata } from "./catalog";
export const repositoryUrl = "https://github.com/replicraft/remade";
export const contributeUrl = `${repositoryUrl}/blob/main/CONTRIBUTING.md`;
export const label = (value: string) =>
	value.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
export function metadataFor(entry: Entry, metadata: Record<string, Metadata>) {
	const url = new URL(entry.repository);
	return url.hostname === "github.com"
		? metadata[url.pathname.slice(1).toLowerCase()]
		: undefined;
}
export function entryUrl(entry: Entry) {
	return `/${entry.kind === "tool" ? "tools" : "projects"}/${entry.slug}/`;
}
export function recent(entries: Entry[]) {
	return [...entries].sort(
		(a, b) =>
			(b.addedAt ?? "").localeCompare(a.addedAt ?? "") ||
			a.name.localeCompare(b.name),
	);
}

export function findBySlug<T extends { slug: string }>(
	items: readonly T[],
	slug: string,
): T {
	const item = items.find((item) => item.slug === slug);
	if (!item) {
		throw new Error(`Missing catalog record: ${slug}`);
	}
	return item;
}
