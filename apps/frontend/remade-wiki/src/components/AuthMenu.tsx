import { LogIn } from "lucide-react";
import { useEffect, useState } from "react";
import Dropdown from "react-dropdown";
import {
	type Account,
	apiUrl,
	hasLoginHint,
	logout,
	resolveAccount,
} from "../lib/auth";

export default function AuthMenu() {
	const [account, setAccount] = useState<Account | null>(null);
	const [message, setMessage] = useState("");
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		if (!hasLoginHint(document.cookie)) return;

		const controller = new AbortController();

		void resolveAccount(controller.signal)
			.then((user) => {
				if (!controller.signal.aborted) setAccount(user);
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
		} catch {
			setMessage("Couldn’t log out. Please try again.");
		} finally {
			setBusy(false);
		}
	}

	if (!account) {
		return (
			<a
				className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-3 font-semibold hover:border-lime"
				href={`${apiUrl}/auth/github`}
			>
				<LogIn aria-hidden="true" size={16} />
				Login
			</a>
		);
	}

	const name =
		account.displayName || account.identities[0]?.username || "Account";

	return (
		<div className="relative">
			<Dropdown
				aria-label={`Account menu for ${name}`}
				baseClassName="AuthDropdown"
				className="relative"
				controlClassName="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-line hover:border-lime"
				menuClassName="absolute right-0 top-full z-30 mt-2 w-56 max-w-[calc(100vw-36px)] break-words rounded-lg border border-line bg-panel p-3 shadow-lg"
				onChange={() => void signOut()}
				optionClassName={() =>
					"mt-2 cursor-pointer rounded px-3 py-2 text-lime hover:bg-surface"
				}
				options={[
					{
						type: "group",
						name,
						items: [
							{ value: "logout", label: busy ? "Logging out…" : "Logout" },
						],
					},
				]}
				placeholder={
					account.avatarUrl ? (
						<img
							alt=""
							className="size-10"
							height={40}
							src={account.avatarUrl}
							width={40}
						/>
					) : (
						<span>{name.slice(0, 1)}</span>
					)
				}
				value={null}
			/>

			{message && (
				<p
					aria-live="polite"
					className="absolute right-0 top-full z-30 mt-2 w-56 rounded-lg border border-line bg-panel p-3 text-sm"
					role="status"
				>
					{message}
				</p>
			)}
		</div>
	);
}
