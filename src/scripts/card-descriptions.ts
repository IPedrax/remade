function fitDescription(container: HTMLElement) {
	const text = container.querySelector<HTMLElement>("[data-card-text]");
	const link = container.querySelector<HTMLAnchorElement>(
		"[data-card-read-more]",
	);
	if (!text || !link) return;

	text.style.webkitLineClamp = "unset";
	text.style.display = "block";
	link.hidden = true;
	link.style.display = "none";

	// Hidden cards in filtered lists are measured when they become visible again.
	if (container.clientHeight === 0) return;
	link.hidden = false;
	link.style.display = "block";
	const lineHeight = Number.parseFloat(getComputedStyle(text).lineHeight);
	const linkSpace =
		link.offsetHeight + Number.parseFloat(getComputedStyle(link).marginTop);
	const fullHeight = text.scrollHeight;
	const card = container.closest("article");
	if (card) {
		// Wrapped headings and footers must not squeeze the preview to a sentence.
		const chromeHeight =
			card.getBoundingClientRect().height - container.clientHeight;
		const previewHeight = Math.min(fullHeight, lineHeight * 6);
		const minimumHeight = Math.ceil(
			Math.max(
				360,
				chromeHeight +
					previewHeight +
					(fullHeight > previewHeight ? linkSpace : 0),
			),
		);
		const value = `${minimumHeight}px`;
		if (card.style.minHeight !== value) card.style.minHeight = value;
	}
	if (fullHeight <= container.clientHeight + 1) {
		link.hidden = true;
		link.style.display = "none";
		return;
	}
	const lines = Math.max(
		1,
		Math.floor((container.clientHeight - linkSpace) / lineHeight),
	);
	text.style.display = "-webkit-box";
	text.style.setProperty("-webkit-box-orient", "vertical");
	text.style.webkitLineClamp = String(lines);
}

const descriptions = document.querySelectorAll<HTMLElement>(
	"[data-card-description]",
);
const observer = new ResizeObserver((entries) => {
	for (const entry of entries) {
		if (entry.target instanceof HTMLElement) fitDescription(entry.target);
	}
});
for (const description of descriptions) observer.observe(description);
void document.fonts.ready.then(() => {
	for (const description of descriptions) fitDescription(description);
});
