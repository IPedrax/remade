import {
	formatStars,
	type Metadata,
	relativeDate,
	shortDate,
} from "../lib/presentation";

interface Props {
	metadata?: Metadata;
}

export default function Stats({ metadata }: Props) {
	return (
		<section className="max-w-[780px]">
			<h2>Repository activity</h2>

			{metadata ? (
				<>
					<dl className="grid grid-cols-1 gap-4 min-[600px]:grid-cols-2 [&>div]:border-b [&>div]:border-line [&>div]:py-3">
						<div>
							<dt>GitHub stars</dt>

							<dd title={metadata.stars.toLocaleString("en")}>
								{formatStars(metadata.stars)}
							</dd>
						</div>

						<div>
							<dt>Forks</dt>

							<dd>{metadata.forks.toLocaleString()}</dd>
						</div>

						<div>
							<dt>Last push</dt>

							<dd>
								{metadata.pushedAt ? (
									<time
										dateTime={metadata.pushedAt}
										title={shortDate(metadata.pushedAt)}
									>
										{relativeDate(metadata.pushedAt)}
									</time>
								) : (
									"Unavailable"
								)}
							</dd>
						</div>

						<div>
							<dt>Repository state</dt>

							<dd>{metadata.isArchived ? "Archived" : "Not archived"}</dd>
						</div>
					</dl>

					<p className="mt-4 text-sm">
						Last successful update:{" "}
						<time
							dateTime={metadata.fetchedAt}
							title={shortDate(metadata.fetchedAt)}
						>
							{relativeDate(metadata.fetchedAt)}
						</time>
					</p>
				</>
			) : (
				<p>Statistics currently unavailable</p>
			)}

			<p className="text-xs">
				GitHub statistics are refreshed approximately every 24 hours.
			</p>
		</section>
	);
}
