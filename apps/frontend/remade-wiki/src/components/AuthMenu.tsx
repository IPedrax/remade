import { LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import {
	type Account,
	apiUrl,
	hasLoginHint,
	logout,
	resolveAccount,
} from "../lib/auth";

import UserDropdown from "./UserDropdown";

const loginToastKey = "remade-pending-login-toast";

function rememberLogin() {
	try {
		sessionStorage.setItem(loginToastKey, String(Date.now()));
	} catch {
		// Login still works when browser storage is unavailable.
	}
}

function announceLogin(account: Account | null) {
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

export default function AuthMenu() {
	const [account, setAccount] = useState<Account | null>(null);
	const [message, setMessage] = useState("");
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		if (!hasLoginHint(document.cookie)) return;

		const controller = new AbortController();

		void resolveAccount(controller.signal)
			.then((user) => {
				if (controller.signal.aborted) return;

				setAccount(user);
				announceLogin(user);
			})
			.catch(() => {});

		return () => controller.abort();
	}, []);

	async function signOut() {
		if (busy) return;

		setBusy(true);
		setMessage("");

		try {
			await logout();
			setAccount(null);
			toast.success("Logged out");
		} catch {
			setMessage("Couldn’t log out. Please try again.");
		} finally {
			setBusy(false);
		}
	}

	const toaster = <Toaster closeButton position="bottom-right" theme="dark" />;

	if (!account) {
		return (
			<>
				{toaster}

				<a
					className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-3 font-semibold hover:border-lime"
					href={`${apiUrl}/auth/github`}
					onClick={rememberLogin}
				>
					<LogIn aria-hidden="true" size={16} />
					Login
				</a>
			</>
		);
	}

	return (
		<>
			{toaster}

			<UserDropdown
				account={account}
				busy={busy}
				message={message}
				onLogout={() => void signOut()}
			/>
		</>
	);
}
