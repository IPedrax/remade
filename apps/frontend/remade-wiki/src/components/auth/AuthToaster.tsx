import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Toaster } from "sonner";

export default function AuthToaster() {
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	if (!mounted) return null;

	return createPortal(
		<Toaster closeButton position="bottom-right" theme="dark" />,
		document.body,
	);
}
