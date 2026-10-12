import { ChevronDown, LogOut } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import type { Account } from "../lib/auth";

type UserDropdownProps = {
	account: Account;
	busy: boolean;
	message: string;
	onLogout: () => void;
};

export default function UserDropdown({
	account,
	busy,
	message,
	onLogout,
}: UserDropdownProps) {
	const [open, setOpen] = useState(false);
	const container = useRef<HTMLDivElement>(null);
	const trigger = useRef<HTMLButtonElement>(null);
	const logoutButton = useRef<HTMLButtonElement>(null);
	const panelId = useId();
	const username = account.identities.find(
		(identity) => identity.provider === "github",
	)?.username;
	const name = account.displayName || username || "Account";

	useEffect(() => {
		if (!open) return;

		function dismissOutside(event: PointerEvent | FocusEvent) {
			if (
				event.target instanceof Node &&
				!container.current?.contains(event.target)
			) {
				setOpen(false);
			}
		}

		function dismissWithEscape(event: KeyboardEvent) {
			if (event.key !== "Escape") return;

			event.preventDefault();
			setOpen(false);
			trigger.current?.focus();
		}

		document.addEventListener("pointerdown", dismissOutside);
		document.addEventListener("focusin", dismissOutside);
		document.addEventListener("keydown", dismissWithEscape);

		return () => {
			document.removeEventListener("pointerdown", dismissOutside);
			document.removeEventListener("focusin", dismissOutside);
			document.removeEventListener("keydown", dismissWithEscape);
		};
	}, [open]);

	return (
		<div className="relative" ref={container}>
			<button
				aria-controls={panelId}
				aria-expanded={open}
				aria-label={`Account menu for ${name}`}
				className="inline-flex items-center gap-2 rounded-full border border-line p-1.5 pr-3 hover:border-lime focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime"
				onClick={() => setOpen(!open)}
				onKeyDown={(event) => {
					if (event.key !== "ArrowDown") return;

					event.preventDefault();
					setOpen(true);
					requestAnimationFrame(() => logoutButton.current?.focus());
				}}
				ref={trigger}
				type="button"
			>
				{account.avatarUrl ? (
					<img
						alt=""
						className="size-8 select-none rounded-full"
						height={32}
						src={account.avatarUrl}
						width={32}
					/>
				) : (
					<span
						aria-hidden="true"
						className="flex size-8 items-center justify-center rounded-full bg-panel font-semibold"
					>
						{name.slice(0, 1)}
					</span>
				)}

				<ChevronDown
					aria-hidden="true"
					className={open ? "rotate-180" : ""}
					size={16}
				/>
			</button>

			{open && (
				<div
					className="absolute right-0 top-full z-30 mt-3 w-64 max-w-[calc(100vw-36px)] overflow-hidden rounded-xl border border-line bg-panel shadow-xl"
					id={panelId}
				>
					<div className="border-b border-line px-4 py-3">
						<p className="text-xs text-muted">Signed in as</p>
						<p className="mt-1 break-words font-semibold">{name}</p>
						{username && (
							<p className="mt-1 break-words text-sm text-muted">@{username}</p>
						)}
					</div>

					<div className="p-2">
						<button
							className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-surface hover:text-lime focus-visible:outline-2 focus-visible:outline-lime disabled:cursor-wait disabled:opacity-60"
							disabled={busy}
							onClick={onLogout}
							ref={logoutButton}
							type="button"
						>
							<LogOut aria-hidden="true" size={16} />
							{busy ? "Logging out…" : "Logout"}
						</button>
					</div>
				</div>
			)}

			{message && (
				<p className="mt-2 max-w-64 text-sm text-muted" role="status">
					{message}
				</p>
			)}
		</div>
	);
}
