interface Props {
	authors?: string[];
}
export default function Authors({ authors = [] }: Props) {
	return (
		<>
			{authors.length > 0 && (
				<div
					className="mt-auto flex shrink-0 flex-wrap gap-x-4 gap-y-2 pt-[18px] text-xs"
					data-pagefind-ignore
				>
					{authors.map((author) => (
						<a
							className="group/author relative z-10 text-sm text-lime hover:underline focus-visible:underline"
							href={`/authors/${author}/`}
							key={author}
						>
							View More by Author ·{" "}
							<span className="inline-block whitespace-nowrap group-hover/author:underline group-focus-visible/author:underline">
								@{author} ↗
							</span>
						</a>
					))}
				</div>
			)}
		</>
	);
}
