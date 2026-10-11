import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import BadgeShare from "../../src/components/BadgeShare";
import { badgeSnippets } from "../../src/lib/badges";

const projectUrl = "https://remade.wiki/projects/solvecraft/";

beforeEach(() => {
	vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("badge sharing", () => {
	it("copies dark Markdown and announces success", async () => {
		const screen = await render(<BadgeShare projectUrl={projectUrl} />);

		await screen
			.getByRole("button", { name: "Copy Markdown", exact: true })
			.click();

		expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
			badgeSnippets(projectUrl).markdown,
		);

		await expect
			.element(screen.getByRole("status"))
			.toHaveTextContent("Copied!");
	});

	it("offers a selectable snippet when copying fails", async () => {
		vi.mocked(navigator.clipboard.writeText).mockRejectedValue(
			new Error("Clipboard denied"),
		);

		const screen = await render(<BadgeShare projectUrl={projectUrl} />);

		await screen
			.getByRole("button", { name: "Copy Markdown", exact: true })
			.click();

		await expect
			.element(screen.getByRole("status"))
			.toHaveTextContent("Couldn’t copy automatically.");

		await expect
			.element(screen.getByRole("textbox", { name: "Badge snippet" }))
			.toHaveValue(badgeSnippets(projectUrl).markdown);
	});

	it("keeps command order, separates variants and resets after selection", async () => {
		const screen = await render(<BadgeShare projectUrl={projectUrl} />);
		const trigger = screen.getByRole("combobox", {
			name: "More badge copy options",
		});

		await trigger.click();

		expect(
			screen
				.getByRole("option")
				.elements()
				.map((element) => element.textContent),
		).toEqual([
			"Copy HTML",
			"Copy BBCode",
			"Copy Markdown (Light)",
			"Copy HTML (Light)",
			"Copy BBCode (Light)",
		]);

		await expect.element(screen.getByRole("separator")).toBeVisible();

		await screen
			.getByRole("option", { name: "Copy HTML (Light)", exact: true })
			.click();

		expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
			badgeSnippets(projectUrl, "light").html,
		);

		await expect.element(trigger).toHaveAttribute("aria-expanded", "false");

		await expect.element(trigger).not.toHaveTextContent("Copy HTML (Light)");

		await trigger.click();

		await screen
			.getByRole("option", { name: "Copy HTML (Light)", exact: true })
			.click();

		expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(2);
	});

	it("supports keyboard selection and Escape dismissal", async () => {
		const screen = await render(<BadgeShare projectUrl={projectUrl} />);
		const trigger = screen.getByRole("combobox", {
			name: "More badge copy options",
		});

		trigger.element().focus();

		await userEvent.keyboard("{ArrowDown}{Enter}");

		expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
			badgeSnippets(projectUrl).html,
		);

		await userEvent.keyboard("{ArrowDown}{Escape}");

		await expect.element(trigger).toHaveAttribute("aria-expanded", "false");

		expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
	});
});
