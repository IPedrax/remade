export interface BrowseEntry {
	name: string;
	search: string;
	category: string;
	categories?: string[];
	languages: string[];
	platforms: string[];
	status: string;
	compatibility: string;
	addedAt: string;
	stars: number | null;
}

export function filterEntries(
	entry: BrowseEntry,
	filters: Record<string, string>,
): boolean {
	const terms = (filters.q ?? "")
		.toLowerCase()
		.trim()
		.split(/\s+/)
		.filter(Boolean);

	return (
		terms.every((term) => entry.search.toLowerCase().includes(term)) &&
		(!filters.category ||
			entry.category === filters.category ||
			(entry.categories?.includes(filters.category) ?? false)) &&
		(!filters.language || entry.languages.includes(filters.language)) &&
		(!filters.platform || entry.platforms.includes(filters.platform)) &&
		(!filters.status || entry.status === filters.status) &&
		(!filters.compatibility || entry.compatibility === filters.compatibility)
	);
}

export function compareEntries(
	a: BrowseEntry,
	b: BrowseEntry,
	sort: string,
): number {
	if (sort === "stars") {
		if (a.stars === null && b.stars !== null) return 1;

		if (b.stars === null && a.stars !== null) return -1;

		const diff = (b.stars ?? 0) - (a.stars ?? 0);

		if (diff) return diff;
	}

	if (sort === "recent") {
		const diff = b.addedAt.localeCompare(a.addedAt);

		if (diff) return diff;
	}

	return a.name.localeCompare(b.name);
}
