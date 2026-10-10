import type { Original, Request } from "../lib/schemas";

interface Props {
	request: Request;
	original: Original;
}
export default function RequestCard({ request, original }: Props) {
	return (
		<article className="relative isolate flex min-w-0 flex-col rounded-xl border border-line bg-surface p-[22px] text-sm hover:border-lime/50 focus-within:border-lime sm:p-[26px]">
			<div className="mb-3.5 flex flex-wrap gap-2">
				<span className="rounded border border-line bg-panel px-2 py-0.5 text-xs text-muted">
					Project Request
				</span>
			</div>
			<h3>
				<a
					className="after:absolute after:inset-0 after:rounded-xl focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-lime"
					href={`/software/${original.slug}/`}
				>
					{original.name} ↗
				</a>
			</h3>
			<p>{request.reason}</p>
			{request.suggested_names && (
				<p>
					Suggested name:{" "}
					<span className="text-lime">
						{request.suggested_names.join(", ")}
					</span>
				</p>
			)}
		</article>
	);
}
