import { type ReactNode, useEffect, useState } from "react";
import {
	createRequestActivityStore,
	RequestActivityContext,
	useRequestActivity,
} from "../../stores/request-activity-store";

export default function RequestActivityProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [store] = useState(createRequestActivityStore);

	useEffect(() => {
		if (!import.meta.env.DEV) return;

		const controller = new AbortController();
		const load = () => void store.getState().load(controller.signal);
		load();
		document.addEventListener("remade-auth-changed", load);

		return () => {
			controller.abort();
			document.removeEventListener("remade-auth-changed", load);
		};
	}, [store]);

	return (
		<RequestActivityContext.Provider value={store}>
			<ActivityNotice />
			{children}
		</RequestActivityContext.Provider>
	);
}

function ActivityNotice() {
	const message = useRequestActivity((state) =>
		state.messageOriginal ? "" : state.message,
	);

	if (!import.meta.env.DEV || !message) return null;

	return (
		<p className="rounded-lg border border-line p-3 text-sm" role="status">
			{message}
		</p>
	);
}
