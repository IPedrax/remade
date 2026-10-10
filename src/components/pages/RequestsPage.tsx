import type { CatalogData } from "../../lib/catalog";

import {
	contributeUrl,
	findBySlug,
	repositoryUrl,
} from "../../lib/presentation";
import RequestCard from "../RequestCard";

interface Props {
	catalog: CatalogData;
}
export default function RequestsPage({ catalog }: Props) {
	return (
		<>
			<div className="max-w-[860px] pt-16">
				<p className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-lime">
					The community wishlist
				</p>
				<h1>Project Requests</h1>
				<p>
					Software people would like to see independently reimplemented. These
					are community wishes, not active or approved implementation projects.
				</p>
				<div className="flex flex-wrap items-center gap-6">
					<a
						className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-lime bg-lime px-4 py-3 text-sm font-semibold text-canvas hover:bg-lime-light hover:text-canvas"
						href={`${repositoryUrl}/issues/new?template=project-request.yml`}
					>
						Submit a request ↗
					</a>
					<a
						className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-line px-4 py-3 text-sm font-semibold text-ink hover:border-lime hover:text-lime"
						href={contributeUrl}
					>
						Know a project? Add it ↗
					</a>
				</div>
			</div>
			<section>
				{catalog.requests.length ? (
					<div className="grid grid-cols-1 gap-[18px] min-[600px]:grid-cols-2 min-[900px]:grid-cols-3">
						{catalog.requests.map((request) => (
							<RequestCard
								key={request.original}
								original={findBySlug(catalog.originals, request.original)}
								request={request}
							/>
						))}
					</div>
				) : (
					<p className="rounded-xl border border-dashed border-line p-8">
						There are no open requests. Suggest a software target using the
						request form.
					</p>
				)}
			</section>
		</>
	);
}
