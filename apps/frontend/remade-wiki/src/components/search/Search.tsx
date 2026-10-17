interface SearchFieldProps {
	value?: string;
	onChange?: (value: string) => void;
	placeholder?: string;
	describedBy?: string;
}

export function SearchField({
	value,
	onChange,
	placeholder = "Search",
	describedBy,
}: SearchFieldProps) {
	return (
		<div className="flex min-w-0 items-center gap-3 rounded-xl bg-[#111116] px-4 py-3 text-muted focus-within:ring-2 focus-within:ring-lime">
			<label className="sr-only" htmlFor="site-search">
				Search software and projects
			</label>

			<svg
				aria-hidden="true"
				className="size-5 shrink-0"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.8"
				viewBox="0 0 24 24"
			>
				<circle cx="10.5" cy="10.5" r="7.5" />

				<path d="m16 16 5 5" />
			</svg>

			<input
				aria-describedby={describedBy}
				className="min-w-0 flex-1 rounded-none border-0 bg-transparent p-0 text-base placeholder:text-muted focus-visible:outline-none"
				id="site-search"
				name="q"
				onChange={
					onChange ? (event) => onChange(event.target.value) : undefined
				}
				placeholder={placeholder}
				type="search"
				value={value}
			/>

			<kbd className="shrink-0 rounded border border-white/15 px-1.5 py-0.5 text-xs font-sans">
				⌘ K
			</kbd>
		</div>
	);
}

export default function Search() {
	return (
		<search className="max-w-[440px]">
			<form action="/explore/" className="group relative">
				<SearchField
					describedBy="home-search-hint"
					placeholder="Search reimplemented projects"
				/>

				<div className="absolute inset-x-0 top-full z-20 mt-2 hidden rounded-xl border border-line bg-panel p-1.5 shadow-lg group-focus-within:group-has-[input:not(:placeholder-shown)]:block">
					<button
						className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left text-sm text-muted hover:bg-surface hover:text-ink"
						id="home-search-hint"
						type="submit"
					>
						<span>Hit enter to search</span>

						<kbd className="font-sans">↵</kbd>
					</button>
				</div>
			</form>
		</search>
	);
}
