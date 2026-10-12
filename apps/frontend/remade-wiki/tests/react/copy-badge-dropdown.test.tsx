import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import CopyBadgeDropdown from "../../src/components/badges/CopyBadgeDropdown";
import { badgeSnippets } from "../../src/lib/badges";

const projectUrl = "https://remade.wiki/projects/solidcraft/";

beforeEach(() => {
	vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
});

afterEach(() => {
	vi.restoreAllMocks();
});

describe("badge sharing", () => {
	it("copies dark Markdown and announces success", async () => {
		const screen = await render(<CopyBadgeDropdown projectUrl={projectUrl} />);

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

		const screen = await render(<CopyBadgeDropdown projectUrl={projectUrl} />);

		await screen
			.getByRole("button", { name: "Copy Markdown", exact: true })
			.click();

		await expect
			.element(screen.getByRole("status"))
			.toHaveTextContent(
				"Couldn’t copy automatically. Select and copy the snippet below.",
			);

		await expect
			.element(screen.getByRole("textbox", { name: "Badge snippet" }))
			.toHaveValue(badgeSnippets(projectUrl).markdown);
	});

	it("keeps command order, separates variants and resets after selection", async () => {
		const screen = await render(<CopyBadgeDropdown projectUrl={projectUrl} />);
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
			"Copy Markdown (Classic)",
			"Copy HTML (Classic)",
			"Copy BBCode (Classic)",
		]);

		expect(screen.getByRole("separator").elements()).toHaveLength(2);

		await expect.element(screen.getByRole("separator").first()).toBeVisible();

		await expect.element(screen.getByRole("separator").last()).toBeVisible();

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

	it.each([
		["Copy Markdown (Classic)", "markdown"],
		["Copy HTML (Classic)", "html"],
		["Copy BBCode (Classic)", "bbcode"],
	] as const)(
		"copies %s while keeping dark Markdown as the primary action",
		async (label, format) => {
			const screen = await render(
				<CopyBadgeDropdown projectUrl={projectUrl} />,
			);

			await screen
				.getByRole("combobox", { name: "More badge copy options" })
				.click();

			await screen.getByRole("option", { name: label, exact: true }).click();

			expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith(
				badgeSnippets(projectUrl, "classic")[format],
			);

			await screen
				.getByRole("button", { name: "Copy Markdown", exact: true })
				.click();

			expect(navigator.clipboard.writeText).toHaveBeenLastCalledWith(
				badgeSnippets(projectUrl).markdown,
			);
		},
	);

	it("supports keyboard selection and Escape dismissal", async () => {
		const screen = await render(<CopyBadgeDropdown projectUrl={projectUrl} />);
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
