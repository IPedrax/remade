import { beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";
import AuthMenu from "../../src/components/AuthMenu";
import * as auth from "../../src/lib/auth";

vi.mock("../../src/lib/auth", { spy: true });

const account: auth.Account = {
	id: "0199c128-5d8f-7a26-b1e8-40c906f33871",
	displayName: "Example User",
	avatarUrl: "https://avatars.githubusercontent.com/u/123",
	identities: [{ provider: "github", username: "example" }],
};

beforeEach(() => {
	vi.clearAllMocks();
	vi.mocked(auth.hasLoginHint).mockReturnValue(false);
	vi.mocked(auth.resolveAccount).mockResolvedValue(account);
	vi.mocked(auth.logout).mockResolvedValue();
});

describe("header authentication", () => {
	it("shows Login without making an anonymous session request", async () => {
		const screen = await render(<AuthMenu />);
		await expect
			.element(screen.getByRole("link", { name: "Login" }))
			.toHaveAttribute("href", `${auth.apiUrl}/auth/github`);
		expect(auth.resolveAccount).not.toHaveBeenCalled();
	});

	it("shows a returning account and logs out through its menu", async () => {
		vi.mocked(auth.hasLoginHint).mockReturnValue(true);
		const screen = await render(<AuthMenu />);
		await screen
			.getByRole("combobox", { name: "Account menu for Example User" })
			.click();
		await expect
			.element(screen.getByText("Example User", { exact: true }))
			.toBeVisible();
		await screen.getByText("Logout", { exact: true }).click();
		await expect
			.element(screen.getByRole("link", { name: "Login" }))
			.toBeVisible();
		expect(auth.logout).toHaveBeenCalledOnce();
		expect(auth.resolveAccount).toHaveBeenCalledOnce();
	});

	it("leaves public navigation usable when the API is unavailable", async () => {
		vi.mocked(auth.hasLoginHint).mockReturnValue(true);
		vi.mocked(auth.resolveAccount).mockRejectedValue(new Error("Offline"));
		const screen = await render(<AuthMenu />);
		await expect
			.element(screen.getByRole("link", { name: "Login" }))
			.toBeVisible();
	});

	it("opens and dismisses the account menu with the keyboard", async () => {
		vi.mocked(auth.hasLoginHint).mockReturnValue(true);
		const screen = await render(<AuthMenu />);
		const trigger = screen.getByRole("combobox", {
			name: "Account menu for Example User",
		});
		await expect.element(trigger).toBeVisible();
		trigger.element().focus();
		await userEvent.keyboard("{ArrowDown}");
		await expect.element(trigger).toHaveAttribute("aria-expanded", "true");
		await userEvent.keyboard("{Escape}");
		await expect.element(trigger).toHaveAttribute("aria-expanded", "false");
		expect(auth.logout).not.toHaveBeenCalled();
	});

	it("shows logout errors and preserves the signed-in account", async () => {
		vi.mocked(auth.hasLoginHint).mockReturnValue(true);
		vi.mocked(auth.logout).mockRejectedValue(new Error("Offline"));
		const screen = await render(<AuthMenu />);
		await screen
			.getByRole("combobox", { name: "Account menu for Example User" })
			.click();
		await screen.getByText("Logout", { exact: true }).click();
		await expect
			.element(screen.getByRole("status"))
			.toHaveTextContent("Couldn’t log out. Please try again.");
		await expect
			.element(
				screen.getByRole("combobox", { name: "Account menu for Example User" }),
			)
			.toBeVisible();
	});
});
