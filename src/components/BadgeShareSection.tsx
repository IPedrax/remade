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

			<img
				alt="Listed on Remade"
				className="mb-5 h-5 w-[127px] max-w-none"
				height={20}
				src={badgePath()}
				width={127}
			/>

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
