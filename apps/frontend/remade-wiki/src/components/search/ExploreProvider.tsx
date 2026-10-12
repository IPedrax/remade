import { type ReactNode, useState } from "react";
import {
	createExploreStore,
	ExploreContext,
} from "../../stores/explore-store.ts";

export default function ExploreProvider({ children }: { children: ReactNode }) {
	const [store] = useState(createExploreStore);

	return (
		<ExploreContext.Provider value={store}>{children}</ExploreContext.Provider>
	);
}
