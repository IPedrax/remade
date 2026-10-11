import { isValid, isWithinInterval, parseISO, subDays } from "date-fns";

export interface RequestFilters {
	q: string;
	vendor: string;
	category: string;
	added: string;
	sort: string;
}
export interface BrowseRequest {
	original: string;
	name: string;
	vendor: string;
	category: string;
	addedAt?: string;
	aliases?: string[];
	suggestedNames?: string[];
	reason?: string;
}
export const defaultRequestFilters: RequestFilters = {
	q: "",
	vendor: "",
	category: "",
	added: "",
	sort: "recent",
};
export const addedPeriods = ["7", "30", "90", "365"] as const;

export function filterRequest(
	request: BrowseRequest,
	filters: RequestFilters,
	now: Date,
): boolean {
	const terms = filters.q
		.trim()
		.toLocaleLowerCase()
		.split(/\s+/)
		.filter(Boolean);
	const searchable = [
		request.name,
		request.original,
		request.vendor.replaceAll("-", " "),
		request.reason ?? "",
		...(request.aliases ?? []),
		...(request.suggestedNames ?? []),
	]
		.join(" ")
		.toLocaleLowerCase();
	if (!terms.every((term) => searchable.includes(term))) return false;
	if (filters.vendor && request.vendor !== filters.vendor) return false;
	if (filters.category && request.category !== filters.category) return false;
	if (filters.added) {
		const date = parseISO(request.addedAt ?? "");
		if (!isValid(date)) return false;
		return isWithinInterval(date, {
			start: subDays(now, Number(filters.added)),
			end: now,
		});
	}
	return true;
}

export function compareRequests(
	a: BrowseRequest,
	b: BrowseRequest,
	sort: string,
) {
	if (sort === "name") return a.name.localeCompare(b.name);
	const aTime = a.addedAt ? Date.parse(a.addedAt) : Number.NaN;
	const bTime = b.addedAt ? Date.parse(b.addedAt) : Number.NaN;
	if (Number.isNaN(aTime) !== Number.isNaN(bTime))
		return Number.isNaN(aTime) ? 1 : -1;
	if (Number.isFinite(aTime) && Number.isFinite(bTime) && aTime !== bTime)
		return sort === "oldest" ? aTime - bTime : bTime - aTime;
	return a.original.localeCompare(b.original);
}
