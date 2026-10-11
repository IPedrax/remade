import { useEffect, useRef, useState } from "react";
import Dropdown, { type DropdownEntry, type Option } from "react-dropdown";
import {
	type BadgeFormat,
	type BadgeVariant,
	badgeSnippets,
} from "../lib/badges";

const options: DropdownEntry[] = [
	{ value: "dark:html", label: "Copy HTML" },
	{ value: "dark:bbcode", label: "Copy BBCode" },
	{
		type: "group",
		name: (
			<>
				<hr className="my-1 border-line" />

				<span className="sr-only">Light badges</span>
			</>
		),
		items: [
			{ value: "light:markdown", label: "Copy Markdown (Light)" },
			{ value: "light:html", label: "Copy HTML (Light)" },
			{ value: "light:bbcode", label: "Copy BBCode (Light)" },
		],
	},
	{
		type: "group",
		name: (
			<>
				<hr className="my-1 border-line" />

				<span className="sr-only">Classic badge</span>
			</>
		),
		items: [
			{ value: "classic:markdown", label: "Copy Markdown (Classic)" },
			{ value: "classic:html", label: "Copy HTML (Classic)" },
			{ value: "classic:bbcode", label: "Copy BBCode (Classic)" },
		],
	},
];

const chevron = (
	<svg
		aria-hidden="true"
		fill="none"
		height="16"
		viewBox="0 0 16 16"
		width="16"
	>
		<path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" />
	</svg>
);

interface Props {
	projectUrl: string;
}

export default function BadgeShare({ projectUrl }: Props) {
	const [message, setMessage] = useState("");
	const [failedSnippet, setFailedSnippet] = useState("");
	const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

	useEffect(() => () => clearTimeout(timer.current), []);

	async function copy(format: BadgeFormat, variant: BadgeVariant = "dark") {
		const snippet = badgeSnippets(projectUrl, variant)[format];

		clearTimeout(timer.current);
		setMessage("");
		setFailedSnippet("");

		try {
			await navigator.clipboard.writeText(snippet);
			setMessage("Copied!");
			timer.current = setTimeout(() => setMessage(""), 2500);
		} catch {
			setMessage(
				"Couldn’t copy automatically. Select and copy the snippet below.",
			);
			setFailedSnippet(snippet);
		}
	}

	function select(option: Option) {
		const [variant, format] = String(option.value).split(":") as [
			BadgeVariant,
			BadgeFormat,
		];

		void copy(format, variant);
	}

	return (
		<div>
			<div className="inline-flex items-stretch text-sm font-semibold">
				<button
					className="rounded-l-lg border border-lime bg-lime px-4 py-3 text-canvas hover:bg-lime-light"
					onClick={() => void copy("markdown")}
					type="button"
				>
					Copy Markdown
				</button>

				<Dropdown
					aria-label="More badge copy options"
					arrowClosed={chevron}
					arrowOpen={chevron}
					baseClassName="BadgeDropdown"
					className="relative flex"
					controlClassName="flex items-center justify-center rounded-r-lg border border-lime border-l-canvas/30 bg-lime px-3 text-canvas hover:bg-lime-light"
					menuClassName="absolute right-0 top-full z-20 mt-2 w-60 max-w-[calc(100vw-36px)] rounded-lg border border-line bg-panel p-1 shadow-lg"
					onChange={select}
					optionClassName={(_option, { active }) =>
						`cursor-pointer rounded px-3 py-2 hover:bg-surface ${active ? "bg-surface text-lime" : "text-ink"}`
					}
					options={options}
					placeholder={null}
					value={null}
				/>
			</div>

			<p aria-live="polite" className="mb-0 mt-2 min-h-6 text-sm" role="status">
				{message}
			</p>

			{failedSnippet && (
				<label className="mt-2">
					Badge snippet
					<textarea
						className="mt-2 w-full rounded-lg border border-line bg-deep p-3 font-mono text-xs text-ink"
						onFocus={(event) => event.currentTarget.select()}
						readOnly
						rows={4}
						value={failedSnippet}
					/>
				</label>
			)}
		</div>
	);
}
