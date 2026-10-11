import { execFileSync } from "node:child_process";
import { readdir, readFile } from "node:fs/promises";
import { basename, join, relative } from "node:path";
import { pathToFileURL } from "node:url";
import * as v from "valibot";
import {
	type Catalog,
	featuredSchema,
	originalSchema,
	type Project,
	parseYaml,
	projectSchema,
	requestSchema,
	type Tool,
	toolSchema,
	validateRelationships,
} from "./schemas";

export type Entry =
	| (Project & { kind: "project"; addedAt?: string })
	| (Tool & { kind: "tool"; addedAt?: string });

const root = pathToFileURL(`${process.cwd()}/`);

async function files(directory: string): Promise<string[]> {
	const entries = await readdir(directory, { withFileTypes: true });
	const paths = await Promise.all(
		entries.map((e) =>
			e.isDirectory()
				? files(join(directory, e.name))
				: Promise.resolve(
						e.name.endsWith(".yaml") ? [join(directory, e.name)] : [],
					),
		),
	);

	return paths.flat().sort();
}

async function records<S extends v.GenericSchema>(
	folder: string,
	schema: S,
	key: "slug" | "original",
): Promise<v.InferOutput<S>[]> {
	return Promise.all(
		(await files(new URL(`src/content/catalog/${folder}/`, root).pathname)).map(
			async (path) => {
				const record = v.parse(schema, parseYaml(await readFile(path, "utf8")));

				if (
					typeof record !== "object" ||
					record === null ||
					(record as Record<string, unknown>)[key] !== basename(path, ".yaml")
				)
					throw new Error(`Filename must match ${key}: ${path}`);

				return record;
			},
		),
	);
}

function addedAt(folder: string, slug: string): string | undefined {
	try {
		const output = execFileSync(
			"git",
			[
				"log",
				"--diff-filter=A",
				"--format=%aI",
				"--",
				`:(glob)src/content/catalog/${folder}/**/${slug}.yaml`,
				`src/content/catalog/${folder}/${slug}.yaml`,
			],
			{ cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
		);

		return output.trim().split("\n").filter(Boolean).sort()[0];
	} catch {
		return undefined;
	}
}

export async function loadCatalog() {
	const [originals, projects, tools, requests, featured] = await Promise.all([
		readFile(new URL("src/content/catalog/originals.yaml", root), "utf8").then(
			(s) => v.parse(v.array(originalSchema), parseYaml(s)),
		),
		records("projects", projectSchema, "slug"),
		records("tools", toolSchema, "slug"),
		records("requests", requestSchema, "original"),
		readFile(new URL("src/content/catalog/featured.yaml", root), "utf8").then(
			(s) => v.parse(featuredSchema, parseYaml(s)),
		),
	]);
	const catalog: Catalog = { originals, projects, tools, requests, featured };

	validateRelationships(catalog);

	const entries: Entry[] = [
		...projects.map((p) => ({
			...p,
			kind: "project" as const,
			addedAt: addedAt("projects", p.slug),
		})),
		...tools.map((t) => ({
			...t,
			kind: "tool" as const,
			addedAt: addedAt("tools", t.slug),
		})),
	];
	const requestDirectory = new URL("src/content/catalog/requests/", root)
		.pathname;
	const requestVendors = new Map(
		(await files(requestDirectory)).map((path) => {
			const parts = relative(requestDirectory, path).split("/");

			return [
				basename(path, ".yaml"),
				parts.length > 1 ? parts[0] : "unassigned",
			];
		}),
	);
	const recentRequests = requests
		.map((request) => ({
			...request,
			addedAt: addedAt("requests", request.original),
			vendor: requestVendors.get(request.original) ?? "unassigned",
		}))
		.sort(
			(a, b) =>
				(b.addedAt ?? "").localeCompare(a.addedAt ?? "") ||
				a.original.localeCompare(b.original),
		);

	return { ...catalog, entries, requests: recentRequests };
}

const metadataSchema = v.object({
	stars: v.pipe(v.number(), v.integer(), v.minValue(0)),
	forks: v.pipe(v.number(), v.integer(), v.minValue(0)),
	pushedAt: v.nullable(v.string()),
	isArchived: v.boolean(),
	fetchedAt: v.pipe(v.string(), v.isoTimestamp()),
});

export type Metadata = v.InferOutput<typeof metadataSchema>;

export async function loadMetadata(): Promise<Record<string, Metadata>> {
	try {
		const raw: unknown = JSON.parse(
			await readFile(new URL("cache/github-metadata.json", root), "utf8"),
		);
		const result = v.safeParse(
			v.object({ repositories: v.record(v.string(), v.unknown()) }),
			raw,
		);

		if (!result.success) return {};

		const metadata: Record<string, Metadata> = {};

		for (const [key, value] of Object.entries(result.output.repositories)) {
			const parsed = v.safeParse(metadataSchema, value);

			if (parsed.success) metadata[key.toLowerCase()] = parsed.output;
		}

		return metadata;
	} catch {
		return {};
	}
}

export type CatalogData = Awaited<ReturnType<typeof loadCatalog>>;

export {
	contributeUrl,
	entryUrl,
	label,
	metadataFor,
	recent,
	repositoryUrl,
} from "./presentation";
