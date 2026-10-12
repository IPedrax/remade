import { type ReactNode, useState } from "react";
import { AuthContext, createAuthStore } from "../../stores/auth-store.ts";

export default function AuthProvider({ children }: { children: ReactNode }) {
	const [store] = useState(createAuthStore);

	return <AuthContext.Provider value={store}>{children}</AuthContext.Provider>;
}
