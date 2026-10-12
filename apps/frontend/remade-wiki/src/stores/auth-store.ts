import { createContext, useContext } from "react";
import { toast } from "sonner";
import { useStore } from "zustand";
import { createStore } from "zustand/vanilla";
import {
	type Account,
	hasLoginHint,
	logout,
	resolveAccount,
} from "../lib/auth";
import { announceLogin } from "../lib/auth-notifications";

interface AuthState {
	status: "checking" | "signed-in" | "signed-out" | "unavailable";
	account: Account | null;
	busy: boolean;
	message: string;
	initialize: (signal: AbortSignal) => Promise<void>;
	signOut: () => Promise<void>;
}

export function createAuthStore() {
	return createStore<AuthState>()((set, get) => ({
		account: null,
		status: "checking",
		busy: false,
		message: "",
		initialize: async (signal) => {
			if (!hasLoginHint(document.cookie)) {
				set({ account: null, status: "signed-out" });
				return;
			}

			set({ status: "checking" });

			try {
				const account = await resolveAccount(signal);
				if (signal.aborted) return;

				set({ account, status: account ? "signed-in" : "signed-out" });
				document.dispatchEvent(new Event("remade-auth-changed"));
				announceLogin(account);
			} catch {
				// An unavailable API does not confirm the user is signed out.
				if (!signal.aborted) set({ status: "unavailable" });
			}
		},
		signOut: async () => {
			if (get().busy) return;

			set({ busy: true, message: "" });

			try {
				await logout();
				set({ account: null, status: "signed-out" });
				document.dispatchEvent(new Event("remade-auth-changed"));
				toast.success("Logged out");
			} catch {
				set({ message: "Couldn’t log out. Please try again." });
			} finally {
				set({ busy: false });
			}
		},
	}));
}

export const AuthContext = createContext<ReturnType<
	typeof createAuthStore
> | null>(null);

export function useAuthStore<T>(selector: (state: AuthState) => T): T {
	const store = useContext(AuthContext);

	if (!store) throw new Error("AuthProvider is required");

	return useStore(store, selector);
}
