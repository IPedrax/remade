import { toast } from "sonner";
import type { Account } from "./auth";

const loginToastKey = "remade-pending-login-toast";

export function rememberLogin() {
	try {
		sessionStorage.setItem(loginToastKey, String(Date.now()));
	} catch {
		// Login still works when browser storage is unavailable.
	}
}

export function announceLogin(account: Account | null) {
	try {
		const pending = sessionStorage.getItem(loginToastKey);
		sessionStorage.removeItem(loginToastKey);

		const username = account?.identities.find(
			(identity) => identity.provider === "github",
		)?.username;
		const elapsed = Date.now() - Number(pending);

		if (pending && username && elapsed >= 0 && elapsed < 10 * 60 * 1000) {
			toast.success(`Logged in as ${username}`);
		}
	} catch {
		// Storage is only used to avoid announcing login on every page load.
	}
}
