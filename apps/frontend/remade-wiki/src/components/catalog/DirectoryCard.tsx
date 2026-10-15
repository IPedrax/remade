import type { DirectoryRecord } from "../../lib/directory";
import { badgeLanguages, formatStars, label } from "../../lib/presentation";
import DiscordLinks from "./DiscordLinks";

export default function DirectoryCard({ record }: { record: DirectoryRecord }) {
	return (
		<article className="directory-card">
			<div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
				<span>
					{record.kind === "request"
						? "Project Request"
						: record.kind === "tool"
							? "Supporting tool"
							: "Reimplementation"}
				</span>
				<span>
					{record.kind === "request"
						? label(record.category)
						: record.status
							? label(record.status)
							: "Status not documented"}
				</span>
			</div>
			<h3>
				<a href={record.href}>{record.name}</a>
			</h3>
			{record.kind === "project" && (
				<p className="!mb-3 text-xs">Reimplements {record.target}</p>
			)}
			{record.languages.length > 0 && (
				<p className="!mb-3 text-xs">
					{badgeLanguages(record.languages).join(" · ")}
				</p>
			)}
			<p className="directory-summary">{record.summary}</p>
			{record.suites.length > 0 && (
				<p className="!mb-3 text-xs">
					{record.kind === "tool" ? "Tool for" : "Part of"}{" "}
					{record.suites.map((suite, index) => (
						<span key={suite.href}>
							{index > 0 && ", "}
							<a href={suite.href}>{suite.name}</a>
						</span>
					))}
				</p>
			)}
			{record.kind === "tool" && record.targets.length > 0 && (
				<p className="!mb-3 text-xs">
					{record.suites.length ? "Also supports" : "Tool for"}{" "}
					{record.targets.map((target, index) => (
						<span key={target.href}>
							{index > 0 && ", "}
							<a href={target.href}>{target.name}</a>
						</span>
					))}
				</p>
			)}
			<DiscordLinks
				discord_server={record.discord_server}
				discord_thread={record.discord_thread}
			/>
			<div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4 text-xs text-muted">
				<a className="font-semibold text-ink" href={record.href}>
					{record.kind === "request"
						? "View request"
						: record.kind === "tool"
							? "View tool"
							: "View project"}{" "}
					→
				</a>
				<span>
					{record.kind === "request"
						? "Community wish"
						: record.stars !== null
							? `★ ${formatStars(record.stars)}`
							: record.authors.length
								? `@${record.authors[0]}`
								: "Public source"}
				</span>
			</div>
		</article>
	);
}
