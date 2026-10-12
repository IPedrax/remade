import { execFile } from "node:child_process";
import { promisify } from "node:util";

const runGit = promisify(execFile);
type AdditionDates = Map<string, string>;
let cachedHistory:
	| { revision: string; dates: Promise<AdditionDates> }
	| undefined;

export function parseAdditionDates(output: string): AdditionDates {
	const dates: AdditionDates = new Map();
	let date = "";

	for (const line of output.split("\n")) {
		if (line.startsWith("\0")) {
			date = line.slice(1).trim();
			continue;
		}

		const match = line.match(
			/^(?:apps\/frontend\/remade-wiki\/)?src\/content\/catalog\/(projects|tools|requests)\/(?:.*\/)?([a-z0-9-]+)\.yaml$/,
		);

		if (!match || !date) continue;

		const key = `${match[1]}/${match[2]}`;
		const previous = dates.get(key);

		if (!previous || date < previous) dates.set(key, date);
	}

	return dates;
}

export function catalogAddedAt(
	dates: AdditionDates,
	folder: string,
	slug: string,
	previousSlugs: string[] = [],
): string | undefined {
	return [slug, ...previousSlugs]
		.map((name) => dates.get(`${folder}/${name}`))
		.filter((date): date is string => date !== undefined)
		.sort()[0];
}

export async function loadAdditionDates(
	repositoryRoot: URL,
): Promise<AdditionDates> {
	try {
		const { stdout } = await runGit("git", ["rev-parse", "HEAD"], {
			cwd: repositoryRoot,
		});
		const revision = stdout.trim();

		if (cachedHistory?.revision === revision) return await cachedHistory.dates;

		const dates = runGit(
			"git",
			[
				"log",
				revision,
				"--diff-filter=A",
				"--format=%x00%aI",
				"--name-only",
				"--",
				"apps/frontend/remade-wiki/src/content/catalog/",
				"src/content/catalog/",
			],
			{ cwd: repositoryRoot, maxBuffer: 32 * 1024 * 1024 },
		).then(({ stdout }) => parseAdditionDates(stdout));

		cachedHistory = { revision, dates };

		return await dates;
	} catch {
		// History is best-effort; failures must not hide approved entries.
		cachedHistory = undefined;
		return new Map();
	}
}
