import { Info } from "lucide-react";
import type { ReactNode } from "react";
import { badgePath } from "../lib/badges";

interface Props {
	title?: string;
	children?: ReactNode;
}

export default function BadgeShareSection({
	title = "Share this project",
	children,
}: Props) {
	return (
		<section
			aria-labelledby="share-heading"
			className="max-w-[780px]"
			data-pagefind-ignore
		>
			<div className="mb-6 flex items-center gap-3">
				<h2 className="mb-0" id="share-heading">
					{title}
				</h2>

				<a
					aria-label="About Remade badges"
					className="inline-flex shrink-0 rounded text-muted hover:text-lime"
					href="/about/badges/"
					title="About Remade badges"
				>
					<Info aria-hidden="true" size={16} />
				</a>
			</div>

			<h3 className="mb-3 text-base font-semibold">Badges</h3>

			<details className="mb-5">
				<summary className="w-fit cursor-pointer text-sm text-lime hover:underline">
					<span className="ml-1">View Badges</span>
				</summary>

				<div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
					{(["dark", "light", "classic"] as const).map((variant) => (
						<figure
							className="m-0 rounded-lg border border-line bg-panel p-4"
							key={variant}
						>
							<figcaption className="mb-4 text-sm font-semibold capitalize text-ink">
								{variant === "dark" ? "Dark (Default)" : variant}
							</figcaption>

							<img
								alt={`Listed on Remade (${variant})`}
								className="h-5 w-auto"
								height={20}
								src={badgePath(variant)}
								width={variant === "classic" ? 115 : 127}
							/>
						</figure>
					))}
				</div>
			</details>

			{children}

			<noscript>
				<p className="text-sm">Enable JavaScript to copy a badge snippet.</p>
			</noscript>

			<a className="text-sm text-lime hover:underline" href="/about/badges/">
				About Remade badges
			</a>
		</section>
	);
}
