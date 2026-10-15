interface Props {
	authors?: string[];
}

export default function Authors({ authors = [] }: Props) {
	return (
		<>
			{authors.length > 0 && (
				<div
					className="mt-auto flex shrink-0 flex-col gap-1 pt-[18px] text-sm"
					data-pagefind-ignore
				>
					<p className="font-semibold text-ink">
						{authors.length === 1 ? "Author:" : "Authors:"}
					</p>

					<div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
						{authors.map((author, index) => (
							<span className="inline-flex items-baseline gap-2" key={author}>
								{index > 0 && <span aria-hidden="true">·</span>}

								<a
									className="relative z-10 whitespace-nowrap text-lime hover:underline focus-visible:underline"
									href={`/authors/${author}/`}
								>
									@{author} ↗
								</a>
							</span>
						))}
					</div>
				</div>
			)}
		</>
	);
}
