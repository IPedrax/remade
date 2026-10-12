import Search from "../search/Search";

export default function NotFoundPage() {
	return (
		<>
			<div className="max-w-[780px] pb-10 pt-14 sm:pt-[90px] [&_h1]:text-[clamp(2.4rem,6vw,4.8rem)] [&_p]:text-lg">
				<p className="mb-5 text-xs font-bold uppercase tracking-[0.16em] text-lime">
					404
				</p>

				<h1>This page hasn’t been remade.</h1>

				<p>Try searching the directory or head back to Explore.</p>

				<a className="text-sm text-lime hover:underline" href="/explore/">
					Explore the directory →
				</a>
			</div>

			<Search />
		</>
	);
}
