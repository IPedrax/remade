import { expect, test } from "@playwright/test";

test("home navigation opens the implementation directory", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByRole("heading", { level: 1 })).toContainText(
		/Everything can\s*be remade/,
	);
	await page
		.getByRole("navigation")
		.getByRole("link", { name: "Explore", exact: true })
		.click();
	await expect(page).toHaveURL(/\/explore\/$/);
	await expect(page.getByRole("heading", { level: 1 })).toContainText(
		"Find what’s been remade.",
	);
});

test("JavaScript filters still find tools whose badges only show TypeScript", async ({
	page,
}) => {
	await page.goto("/explore/?q=lazymaplayers&language=JavaScript");
	await expect(
		page.getByRole("combobox", { name: "Language", exact: true }),
	).toHaveValue("JavaScript");
	const card = page.getByRole("article").filter({
		has: page.getByRole("heading", {
			name: "LazyMapLayers for EffectCraft ↗",
		}),
	});
	await expect(card).toBeVisible();
	await expect(card.getByText("TypeScript", { exact: true })).toBeVisible();
	await expect(card.getByText("JavaScript", { exact: true })).toHaveCount(0);
	await card.getByRole("link", { name: "EffectCraft", exact: true }).click();
	await expect(page).toHaveURL(/\/projects\/effectcraft\/$/);
});

test("Explore finds requests when the implementation search is empty", async ({
	page,
}) => {
	await page.goto("/explore/?q=Nomad%20Sculpt");
	await expect(
		page.getByRole("heading", { name: "No matching entries" }),
	).toBeVisible();
	await expect(
		page.getByRole("link", { name: /Nomad Sculpt/ }).first(),
	).toBeVisible();
});

test("request search points visitors to existing implementations", async ({
	page,
}) => {
	await page.goto("/requests/?q=Outlook");
	await expect(
		page.getByRole("heading", { name: "Matching implementations" }),
	).toBeVisible();
	await page.getByRole("link", { name: "MailCraft ↗", exact: true }).click();
	await expect(page).toHaveURL(/\/projects\/mailcraft\/$/);
});

test("software comparisons open without client-side JavaScript", async ({
	browser,
}) => {
	const context = await browser.newContext({ javaScriptEnabled: false });
	try {
		const page = await context.newPage();
		await page.goto("http://127.0.0.1:4377/software/adobe-animate/");
		await page.getByText("Compare", { exact: true }).click();
		const table = page.getByRole("table", {
			name: "Compare implementations of Adobe Animate",
		});
		await expect(table).toBeVisible();
		await expect(table.getByRole("link", { name: /Flare/ })).toBeVisible();
		await expect(
			table.getByRole("link", { name: /AnimationCraft/ }),
		).toBeVisible();
	} finally {
		await context.close();
	}
});

test("static catalog exports and discovery files are served by the production build", async ({
	request,
}) => {
	const catalogResponse = await request.get("/data/catalog.json");
	expect(catalogResponse.ok()).toBe(true);
	const catalog = await catalogResponse.json();
	expect(catalog.schemaVersion).toBe(1);
	expect(catalog.projects.length).toBeGreaterThan(0);
	expect(
		catalog.projects.every(
			(project: { originals?: string[] }) => project.originals?.length,
		),
	).toBe(true);
	const requestsResponse = await request.get("/data/requests.json");
	expect(requestsResponse.ok()).toBe(true);
	expect((await requestsResponse.json()).requests.length).toBeGreaterThan(0);
	expect(await (await request.get("/robots.txt")).text()).toContain(
		"Sitemap: https://remade.wiki/sitemap-index.xml",
	);
	expect((await request.get("/sitemap-index.xml")).ok()).toBe(true);
});
