import { useEffect, useState } from "react";

interface Match {
	url: string;
	meta: { title?: string };
}

interface Pagefind {
	search: (
		query: string,
	) => Promise<{ results: { data: () => Promise<Match> }[] }>;
}

export default function SiteSearchResults({ query }: { query: string }) {
	const [matches, setMatches] = useState<Match[]>([]);
	const [status, setStatus] = useState("");

	useEffect(() => {
		let cancelled = false;

		setMatches([]);

		if (!query.trim()) {
			setStatus("");

			return;
		}

		setStatus("Searching the site…");

		const timer = setTimeout(async () => {
			try {
				const path = "/pagefind/pagefind.js";
				const pagefind = (await import(/* @vite-ignore */ path)) as Pagefind;
				const results = await pagefind.search(query);
				const pages = await Promise.all(
					results.results.slice(0, 8).map((result) => result.data()),
				);

				if (cancelled) return;

				setMatches(pages);
				setStatus(pages.length ? "" : "No other matching pages.");
			} catch {
				if (!cancelled) setStatus("");
			}
		}, 180);

		return () => {
			cancelled = true;
			clearTimeout(timer);
		};
	}, [query]);

	if (!query.trim() || (!matches.length && !status)) return null;

	return (
		<section>
			<h2>More from the directory</h2>

			{status && <p role="status">{status}</p>}

			<ul className="mt-6 space-y-3">
				{matches.map((match) => (
					<li key={match.url}>
						<a className="text-sm text-lime hover:underline" href={match.url}>
							{match.meta.title ?? match.url}
						</a>
					</li>
				))}
			</ul>
		</section>
	);
}
