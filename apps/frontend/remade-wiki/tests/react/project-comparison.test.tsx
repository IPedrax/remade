import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";
import ProjectComparison from "../../src/components/catalog/ProjectComparison";
import { shortDate } from "../../src/lib/presentation";
import { project, second, stats } from "../fixtures/comparison";

describe("project comparison", () => {
	it.each([[], [project]].map((projects) => ({ projects })))(
		"omits comparisons with fewer than two projects: %j",
		async ({ projects }) => {
			const screen = await render(
				<ProjectComparison
					metadata={{}}
					originalName="Target"
					projects={projects}
				/>,
			);

			await expect
				.element(screen.getByText("Compare", { exact: true }))
				.not.toBeInTheDocument();
		},
	);

	it("opens the comparison and shows project details and honest activity fallbacks", async () => {
		const screen = await render(
			<ProjectComparison
				metadata={{ "example/alpha": stats }}
				originalName="Target"
				projects={[project, second]}
			/>,
		);
		const table = screen.getByRole("table", {
			name: "Compare implementations of Target",
			includeHidden: true,
		});

		await expect.element(table).not.toBeVisible();

		await screen.getByText("Compare", { exact: true }).click();

		await expect.element(table).toBeVisible();

		await expect
			.element(table.getByRole("link", { name: "Alpha ↗" }))
			.toHaveAttribute("href", "/projects/alpha/");

		await expect
			.element(table.getByRole("link", { name: "Beta ↗" }))
			.toHaveAttribute("href", "/projects/beta/");

		for (const name of [
			"Languages",
			"Platforms",
			"Compatibility",
			"Maturity",
			"License",
			"Limitations",
			"Repository state",
			"Statistics updated",
		])
			await expect
				.element(table.getByRole("rowheader", { name, exact: true }))
				.toBeVisible();

		await expect
			.element(
				table
					.getByRole("row", { name: /Platforms/ })
					.getByRole("cell", { name: "Linux, Windows", exact: true }),
			)
			.toBeVisible();

		await expect
			.element(
				table
					.getByRole("row", { name: /Platforms/ })
					.getByRole("cell", { name: "Not documented", exact: true }),
			)
			.toBeVisible();

		await expect
			.element(
				table
					.getByRole("row", { name: /Compatibility/ })
					.getByRole("cell", { name: "Targeting", exact: true })
					.first(),
			)
			.toBeVisible();

		await expect
			.element(
				table
					.getByRole("row", { name: /Maturity/ })
					.getByRole("cell", { name: "Experimental", exact: true })
					.first(),
			)
			.toBeVisible();

		await expect
			.element(
				table
					.getByRole("row", { name: /License/ })
					.getByRole("cell", { name: "MIT", exact: true })
					.first(),
			)
			.toBeVisible();

		await expect
			.element(
				table
					.getByRole("row", { name: /Limitations/ })
					.getByRole("cell", {
						name: "Project files are not yet supported.",
						exact: true,
					})
					.first(),
			)
			.toBeVisible();

		await expect
			.element(
				table
					.getByRole("row", { name: /Repository state/ })
					.getByRole("cell", { name: "Archived", exact: true }),
			)
			.toBeVisible();

		await expect
			.element(
				table
					.getByRole("row", { name: /Repository state/ })
					.getByRole("cell", { name: "Unavailable", exact: true }),
			)
			.toBeVisible();

		await expect
			.element(
				table
					.getByRole("row", { name: /Last repository push/ })
					.getByRole("cell", { name: "Unavailable", exact: true })
					.first(),
			)
			.toBeVisible();

		await expect
			.element(
				table
					.getByRole("row", { name: /Last repository push/ })
					.getByTitle(shortDate(stats.pushedAt ?? "")),
			)
			.toHaveAttribute("datetime", stats.pushedAt ?? "");

		await expect
			.element(table.getByRole("columnheader", { name: "Feature" }))
			.toHaveAttribute("scope", "col");

		await expect
			.element(table.getByRole("rowheader", { name: "Languages" }))
			.toHaveAttribute("scope", "row");

		await screen.getByText("Compare", { exact: true }).click();

		await expect.element(table).not.toBeVisible();
	});
});
