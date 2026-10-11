import { contributeUrl, repositoryUrl } from "../../lib/presentation";

const mission = [
	["Discover", "Find projects worth exploring."],
	["Learn", "See how software is rebuilt."],
	["Preserve", "Keep functionality accessible."],
	["Contribute", "Help grow the directory."],
];

export default function AboutPage() {
	return (
		<>
			<div className="max-w-[860px] pt-14 sm:pt-[90px]">
				<p className="mb-5 text-xs font-bold uppercase tracking-wide">
					About Remade
				</p>

				<h1>Everything can be remade.</h1>

				<p className="max-w-[660px] text-lg sm:text-xl">
					A home for the people and projects rebuilding software from the ground
					up.
				</p>
			</div>

			<div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,780px)_1fr] lg:gap-16">
				<div className="min-w-0">
					<section aria-labelledby="story-heading" className="mt-0">
						<p className="mb-3 text-xs font-bold uppercase tracking-wide">
							Our story
						</p>

						<h2 id="story-heading">Built from curiosity.</h2>

						<p>Software doesn&apos;t have to be built just once.</p>

						<p>
							Some of the most interesting projects in software engineering
							begin with a simple question:{" "}
							<em>What if we built this ourselves?</em> Whether it&apos;s
							recreating a familiar application, reproducing an operating
							system&apos;s behavior, or implementing a compatible alternative
							from scratch, these projects demonstrate what&apos;s possible
							through curiosity, ingenuity, and persistence.
						</p>

						<p>
							Yet many of these efforts are scattered across GitHub, personal
							websites, and obscure corners of the internet. Some have thriving
							communities. Others are maintained by a handful of dedicated
							developers. Many are difficult to discover unless you already know
							what you&apos;re looking for.
						</p>

						<p className="mb-0 font-semibold text-ink">
							Remade was created to bring these projects together.
						</p>
					</section>

					<section aria-labelledby="mission-heading">
						<p className="mb-3 text-xs font-bold uppercase tracking-wide">
							Our mission
						</p>

						<h2 id="mission-heading">Make reimplementation discoverable.</h2>

						<p className="text-lg text-ink">
							To document, celebrate, and make independently developed software
							reimplementations accessible to everyone.
						</p>

						<p>
							Document independent engineering efforts, celebrate their
							creators, encourage interoperability, and inspire the next
							generation of software recreations.
						</p>

						<ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-6 border-y border-line py-7 sm:grid-cols-2">
							{mission.map(([title, description]) => (
								<li key={title}>
									<h3 className="mb-1 text-base">{title}</h3>

									<p className="mb-0 text-sm">{description}</p>
								</li>
							))}
						</ul>
					</section>

					<section aria-labelledby="philosophy-heading">
						<p className="mb-3 text-xs font-bold uppercase tracking-wide">
							Our philosophy
						</p>

						<h2 id="philosophy-heading">Why reimplementation matters.</h2>

						<p>
							Reimplementing software is rarely the easiest approach, but it can
							be one of the most rewarding. It requires understanding complex
							systems, confronting undocumented behavior, and finding
							independent solutions to problems that others have already solved.
						</p>

						<p>
							The results can extend the useful life of software, improve
							compatibility, introduce new implementation approaches, and
							provide opportunities to learn from existing designs. Familiar
							functionality isn&apos;t necessarily tied to one codebase,
							programming language, or operating system.
						</p>

						<p className="mt-7 border-l-2 border-lime pl-5 text-lg font-semibold text-ink">
							An implementation is one way to solve a problem, not necessarily
							the only way.
						</p>
					</section>

					<section aria-labelledby="community-heading">
						<h2 id="community-heading">Built by the community.</h2>

						<p>
							Remade is open source and community-maintained. Anyone can
							contribute an existing reimplementation, suggest a project for
							inclusion, or submit a Project Request for software they&apos;d
							like to see recreated.
						</p>

						<p>
							Asking for software you wish existed shouldn&apos;t feel like
							shouting into the wind. Project Requests give those ideas a home,
							where people can explain what they need and developers can
							discover something worth building.
						</p>

						<p>
							The directory is curated to keep its focus on independently
							developed implementations. Remade does not develop or maintain the
							projects it lists. Credit belongs to the developers and
							communities behind each implementation.
						</p>
					</section>

					<section aria-labelledby="contribute-heading">
						<h2 id="contribute-heading">Get involved.</h2>

						<p>
							Know of a project we&apos;re missing? Have a reimplementation of
							your own? Want to contribute to the directory?
						</p>

						<p>
							Visit our GitHub repository to read the contribution guidelines
							and help make Remade a more complete resource.
						</p>

						<div className="mt-6 flex flex-wrap gap-3 text-sm font-semibold">
							<a
								className="rounded-lg bg-lime px-5 py-3 text-canvas hover:bg-lime-light hover:text-canvas"
								href={contributeUrl}
								rel="noopener noreferrer"
								target="_blank"
							>
								Contribute to Remade ↗
							</a>

							<a
								className="rounded-lg border border-line px-5 py-3 hover:border-lime"
								href="/explore/"
							>
								Explore projects →
							</a>
						</div>
					</section>
				</div>

				<aside className="border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
					<nav
						aria-label="About resources"
						className="flex flex-col items-start gap-4 text-sm"
					>
						<a
							className="text-lime hover:underline"
							href={repositoryUrl}
							rel="noopener noreferrer"
							target="_blank"
						>
							GitHub repository ↗
						</a>

						<a
							className="text-lime hover:underline"
							href={contributeUrl}
							rel="noopener noreferrer"
							target="_blank"
						>
							Contribution guidelines ↗
						</a>

						<a className="text-lime hover:underline" href="/requests/">
							Project Requests
						</a>

						<a className="text-lime hover:underline" href="/disclaimer/">
							Disclaimer
						</a>
					</nav>
				</aside>
			</div>
		</>
	);
}
