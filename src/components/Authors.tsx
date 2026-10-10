interface Props {
	authors?: string[];
}
export default function Authors({ authors = [] }: Props) {
	return (
		<>
			{authors.length > 0 && (
				<div
					className="mt-auto flex flex-wrap gap-x-4 gap-y-2 pt-[18px] text-xs"
					data-pagefind-ignore
				>
					{authors.map((author) => (
						<a
							className="text-sm text-lime hover:underline"
							href={`/authors/${author}/`}
							key={author}
						>
							View More by Author ·{" "}
							<span className="inline-block whitespace-nowrap">
								@{author} ↗
							</span>
						</a>
					))}
				</div>
			)}
		</>
	);
}
