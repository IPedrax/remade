import { badgePath } from "../../lib/badges";
import { contributeUrl } from "../../lib/presentation";

export default function BadgesPage() {
	return (
		<div className="max-w-[780px] pt-14 sm:pt-[90px]">
			<p className="mb-5 text-xs font-bold uppercase tracking-wide">
				<a className="text-lime hover:underline" href="/about/">
					About Remade
				</a>
			</p>

			<h1>Remade Badges</h1>

			<p className="text-lg">
				Show that your project is listed on Remade with an embeddable badge.
			</p>

			<p>
				Our badges are free to use, lightweight, and available in dark and light
				variants. Add one to your GitHub README, project website, or
				documentation to help others discover your listing.
			</p>

			<section aria-labelledby="available-heading">
				<h2 id="available-heading">Available badges</h2>

				<div className="grid gap-6 sm:grid-cols-2">
					<div className="rounded-xl border border-line bg-surface p-5">
						<h3 className="text-base">Dark (recommended)</h3>

						<div className="mb-4 flex min-h-20 items-center justify-center rounded-lg bg-[#F5F7F2] p-4">
							<img
								alt="Listed on Remade — dark badge"
								className="h-5 w-[127px] max-w-none"
								height={20}
								src={badgePath()}
								width={127}
							/>
						</div>

						<p className="mb-0 text-sm">
							The default badge, featuring Remade&apos;s charcoal and lime-green
							branding.
						</p>
					</div>

					<div className="rounded-xl border border-line bg-surface p-5">
						<h3 className="text-base">Light</h3>

						<div className="mb-4 flex min-h-20 items-center justify-center rounded-lg bg-deep p-4">
							<img
								alt="Listed on Remade — light badge"
								className="h-5 w-[127px] max-w-none"
								height={20}
								src={badgePath("light")}
								width={127}
							/>
						</div>

						<p className="mb-0 text-sm">
							A high-contrast alternative with dark text and logo on a light
							background.
						</p>
					</div>
				</div>
			</section>

			<section aria-labelledby="how-heading">
				<h2 id="how-heading">How to add a badge</h2>

				<ol className="mb-5 list-decimal space-y-2 pl-6 text-muted">
					<li>
						Find your project in the{" "}
						<a className="text-lime hover:underline" href="/explore/">
							Remade directory
						</a>
						.
					</li>
					<li>Open its project or tool detail page.</li>
					<li>
						Find the &ldquo;Share this project&rdquo; or &ldquo;Share this
						tool&rdquo; section.
					</li>
					<li>
						Click &ldquo;Copy Markdown&rdquo; or choose HTML or BBCode from the
						dropdown.
					</li>
					<li>
						Paste the snippet into your README, website, or documentation.
					</li>
				</ol>

				<p>
					Clicking the badge directs visitors to the corresponding Remade
					listing.
				</p>
			</section>

			<section aria-labelledby="guidelines-heading">
				<h2 id="guidelines-heading">Badge usage guidelines</h2>

				<ul className="mb-6 list-disc space-y-2 pl-6 text-muted">
					<li>
						Only use a &ldquo;Listed on Remade&rdquo; badge for projects
						currently included in the directory.
					</li>
					<li>Link the badge to the project&apos;s actual Remade listing.</li>
					<li>
						Do not modify the badge in ways that imply certification or official
						endorsement.
					</li>
					<li>Either variant may be used to suit the surrounding design.</li>
				</ul>

				<p className="border-l-2 border-lime bg-surface px-5 py-4">
					Being listed on Remade does not imply that a project has been audited,
					certified, or officially endorsed by Remade.
				</p>
			</section>

			<section aria-labelledby="submit-heading">
				<h2 id="submit-heading">Not listed yet?</h2>

				<p>
					<a
						className="text-lime hover:underline"
						href={contributeUrl}
						rel="noopener noreferrer"
						target="_blank"
					>
						Read the contribution instructions ↗
					</a>{" "}
					to submit your project for inclusion.
				</p>
			</section>
		</div>
	);
}
