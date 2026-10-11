import { contributeUrl } from "../lib/presentation";

export default function RepositoryMirrors({ mirrors }: { mirrors?: string[] }) {
	return (
		<>
			<p className="mb-2 text-base">Repository Mirrors</p>

			{mirrors?.length ? (
				<details className="mb-6">
					<summary className="w-fit cursor-pointer text-sm text-lime hover:underline">
						<span className="ml-1">View Mirrors</span>
					</summary>

					<div className="mt-3">
						<ul className="flex flex-wrap list-none gap-4 rounded-lg border border-line p-4">
							{mirrors.map((mirror) => (
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
		</>
	);
}
