import { createHash, createHmac } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { Miniflare } from "miniflare";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const origin = "https://remade.wiki";
const api = "https://api.remade.wiki";
let worker: Miniflare;
let mode = "success";
let providerCalls = 0;
let userCalls = 0;
let releaseRace: (() => void) | undefined;
let barrier: Promise<void>;
let username = "example";

beforeAll(async () => {
	worker = new Miniflare({
		cf: false,
		workers: [
			{
				config: {
					name: "remade-api-test",
					compatibilityDate: "2026-10-06",
					manifest: {
						mainModule: "index.js",
						modules: {
							"index.js": {
								type: "esm",
								contents: await readFile(
									new URL(
										"../../../../backend/remade-api/build/index.js",
										import.meta.url,
									),
									"utf8",
								),
							},
							"index_bg.wasm": {
								type: "wasm",
								contents: new Uint8Array(
									await readFile(
										new URL(
											"../../../../backend/remade-api/build/index_bg.wasm",
											import.meta.url,
										),
									),
								),
							},
						},
					},
					env: {
						DB: { type: "d1", id: "auth-test" },
						FRONTEND_ORIGIN: { type: "text", value: origin },
						API_ORIGIN: { type: "text", value: api },
						GITHUB_CLIENT_ID: { type: "text", value: "test-client" },
						GITHUB_CLIENT_SECRET: { type: "text", value: "test-secret" },
					},
				},
				dev: {
					outboundService: {
						type: "fetcher",
						handler: async (request) => {
							providerCalls++;
							if (new URL(request.url).hostname === "github.com") {
								const body = new URLSearchParams(await request.text());
								expect(body.get("redirect_uri")).toBe(
									`${api}/api/v1/auth/github/callback`,
								);
								expect(body.get("code_verifier")).toHaveLength(43);
								return Response.json(
									mode === "invalid-code"
										? { error: "bad_verification_code" }
										: {
												access_token: "test-provider-token",
												token_type: "bearer",
											},
								);
							}
							if (mode === "provider-failure")
								return new Response("Unavailable", { status: 503 });
							if (mode === "oversized-response")
								return new Response("x".repeat(65_537));
							if (mode === "invalid-json") return new Response("not json");
							if (mode === "redirected-response")
								return new Response(null, {
									status: 302,
									headers: { Location: "https://evil.example" },
								});
							if (mode === "race") {
								userCalls++;
								if (userCalls === 2) releaseRace?.();
								await barrier;
							}
							return Response.json({
								id: mode === "invalid-id" ? "123" : 123,
								login: username,
								name: "Example",
								avatar_url: "https://avatars.githubusercontent.com/u/123",
							});
						},
					},
				},
			},
		],
	});
	const db = await worker.getD1Database("DB");
	const migrations = new URL(
		"../../../../backend/remade-api/migrations/",
		import.meta.url,
	);
	const filenames = (await readdir(migrations))
		.filter((filename) => /^\d+_.+\.sql$/.test(filename))
		.sort();

	for (const filename of filenames) {
		const sql = await readFile(new URL(filename, migrations), "utf8");

		await db.exec(sql.replaceAll(/--[^\n]*/g, "").replaceAll("\n", " "));
	}
});

beforeEach(async () => {
	mode = "success";
	providerCalls = 0;
	userCalls = 0;
	username = "example";
	barrier = new Promise((resolve) => {
		releaseRace = resolve;
	});
	const db = await worker.getD1Database("DB");
	await db.batch([
		db.prepare("DELETE FROM user_sessions"),
		db.prepare("DELETE FROM user_identities"),
		db.prepare("DELETE FROM users"),
	]);
});

afterAll(async () => {
	await worker?.dispose();
});

async function begin() {
	const response = await worker.dispatchFetch(`${api}/api/v1/auth/github`, {
		redirect: "manual",
	});
	expect(response.status).toBe(302);
	const location = new URL(response.headers.get("Location") || "");
	const cookie = response.headers.getSetCookie()[0].split(";")[0];
	return {
		response,
		location,
		cookie,
		state: location.searchParams.get("state") || "",
	};
}

async function login() {
	const flow = await begin();
	return worker.dispatchFetch(
		`${api}/api/v1/auth/github/callback?code=valid&state=${flow.state}`,
		{ headers: { Cookie: flow.cookie }, redirect: "manual" },
	);
}

function sessionCookie(response: Awaited<ReturnType<typeof login>>) {
	return (
		response.headers
			.getSetCookie()
			.find((cookie) => cookie.startsWith("__Host-remade_session="))
			?.split(";")[0] || ""
	);
}

describe("Worker OAuth and sessions", () => {
	it("uses unpredictable runtime randomness, fixed redirects, and PKCE S256", async () => {
		const a = await begin();
		const b = await begin();
		expect(a.state).not.toBe(b.state);
		expect(a.state).toHaveLength(43);
		const verifier = a.cookie.split("=")[1].split(".")[1];
		expect(a.location.searchParams.get("code_challenge")).toBe(
			createHash("sha256").update(verifier).digest("base64url"),
		);
		expect(a.location.searchParams.get("code_challenge_method")).toBe("S256");
		expect(a.location.searchParams.get("scope")).toBe("");
		expect(a.response.headers.getSetCookie()[0]).toContain("Secure");
		expect(a.response.headers.getSetCookie()[0]).toContain("HttpOnly");
		expect(a.response.headers.getSetCookie()[0]).not.toContain("Domain=");
	});

	it.each([
		"missing",
		"mismatch",
		"tampered",
		"duplicate",
		"expired",
		"no-cookie",
	])("rejects %s callback state before calling GitHub", async (failure) => {
		const flow = await begin();
		const state = failure === "mismatch" ? "x".repeat(43) : flow.state;
		const query =
			failure === "missing"
				? "code=valid"
				: `code=valid&state=${state}${failure === "duplicate" ? `&state=${state}` : ""}`;
		let cookie =
			failure === "tampered" ? flow.cookie.replace(/.$/, "!") : flow.cookie;
		if (failure === "no-cookie") cookie = "";
		if (failure === "expired") {
			const [state, verifier] = flow.cookie.split("=")[1].split(".");
			const payload = `${state}.${verifier}.1`;
			cookie = `__Host-remade_oauth=${payload}.${createHmac("sha256", "test-secret").update(payload).digest("base64url")}`;
		}
		const response = await worker.dispatchFetch(
			`${api}/api/v1/auth/github/callback?${query}`,
			{ headers: { Cookie: cookie } },
		);
		expect(response.status).toBe(400);
		expect(response.headers.getSetCookie()[0]).toContain("Max-Age=0");
		expect(providerCalls).toBe(0);
		const db = await worker.getD1Database("DB");
		expect(
			await db.prepare("SELECT count(*) AS count FROM users").first("count"),
		).toBe(0);
	});

	it.each([
		"invalid-code",
		"provider-failure",
		"invalid-id",
		"oversized-response",
		"invalid-json",
		"redirected-response",
	])("creates no account after %s", async (failure) => {
		mode = failure;
		const response = await login();
		expect(response.status).toBe(400);
		expect(response.headers.getSetCookie()[0]).toContain("Max-Age=0");
		expect(
			await (await worker.getD1Database("DB"))
				.prepare("SELECT count(*) AS count FROM users")
				.first("count"),
		).toBe(0);
		expect(await response.text()).not.toContain("test-provider-token");
	});

	it("rejects a replayed authorization code without creating another session", async () => {
		const flow = await begin();
		const url = `${api}/api/v1/auth/github/callback?code=valid&state=${flow.state}`;
		const options = {
			headers: { Cookie: flow.cookie },
			redirect: "manual" as const,
		};
		expect((await worker.dispatchFetch(url, options)).status).toBe(302);
		mode = "invalid-code";
		const replay = await worker.dispatchFetch(url, options);
		expect(replay.status).toBe(400);
		expect(replay.headers.getSetCookie()[0]).toContain("Max-Age=0");
		const db = await worker.getD1Database("DB");
		expect(
			await db.prepare("SELECT count(*) FROM user_sessions").first("count(*)"),
		).toBe(1);
	});

	it("creates UUIDv7 IDs, stores only hashes and reuses identity after username changes", async () => {
		const response = await login();
		expect(providerCalls).toBe(2);
		expect(response.status).toBe(302);
		expect(response.headers.get("Location")).toBe(`${origin}/`);
		const cookie = sessionCookie(response);
		const token = cookie.split("=")[1];
		const db = await worker.getD1Database("DB");
		const session = await db
			.prepare("SELECT * FROM user_sessions")
			.first<{ id: string; user_id: string; token_hash: string }>();
		expect(session?.token_hash).toBe(
			createHash("sha256").update(token).digest("hex"),
		);
		for (const id of [
			session?.id,
			session?.user_id,
			await db.prepare("SELECT id FROM user_identities").first("id"),
		])
			expect(id).toMatch(
				/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
			);
		expect(
			await db
				.prepare("SELECT provider_user_id FROM user_identities")
				.first("provider_user_id"),
		).toBe("123");
		username = "renamed";
		await login();
		expect(
			await db.prepare("SELECT count(*) FROM users").first("count(*)"),
		).toBe(1);
		const me = await worker.dispatchFetch(`${api}/api/v1/auth/me`, {
			headers: { Cookie: cookie, Origin: origin },
		});
		expect(me.headers.get("Access-Control-Allow-Origin")).toBe(origin);
		expect(me.headers.get("Access-Control-Allow-Credentials")).toBe("true");
		expect(me.headers.get("Cache-Control")).toBe("no-store");
		expect(await me.json()).toMatchObject({
			id: session?.user_id,
			identities: [{ provider: "github", username: "renamed" }],
		});
	});

	it("handles concurrent first logins without orphaned users or duplicate identities", async () => {
		mode = "race";
		const responses = await Promise.all([login(), login()]);
		expect(responses.map((response) => response.status)).toEqual([302, 302]);
		expect(sessionCookie(responses[0])).not.toBe(sessionCookie(responses[1]));
		const db = await worker.getD1Database("DB");
		expect(
			await db.prepare("SELECT count(*) FROM users").first("count(*)"),
		).toBe(1);
		expect(
			await db
				.prepare("SELECT count(*) FROM user_identities")
				.first("count(*)"),
		).toBe(1);
		expect(
			await db
				.prepare("SELECT count(DISTINCT user_id) FROM user_sessions")
				.first("count(DISTINCT user_id)"),
		).toBe(1);
		expect(
			await db.prepare("SELECT count(*) FROM user_sessions").first("count(*)"),
		).toBe(2);
	});

	it("rejects missing, malformed, unknown and expired sessions", async () => {
		const response = await login();
		const cookie = sessionCookie(response);
		for (const value of [
			"",
			"__Host-remade_session=bad",
			`__Host-remade_session=${"A".repeat(43)}`,
		]) {
			expect(
				(
					await worker.dispatchFetch(`${api}/api/v1/auth/me`, {
						headers: { Cookie: value },
					})
				).status,
			).toBe(401);
		}
		await (await worker.getD1Database("DB"))
			.prepare("UPDATE user_sessions SET expires_at = 1")
			.run();
		expect(
			(
				await worker.dispatchFetch(`${api}/api/v1/auth/me`, {
					headers: { Cookie: cookie },
				})
			).status,
		).toBe(401);
	});

	it("rejects logout CSRF, revokes the session and clears both cookies", async () => {
		const cookie = sessionCookie(await login());
		for (const headers of [
			{ Cookie: cookie },
			{ Cookie: cookie, Origin: "https://evil.example" },
			{ Cookie: cookie, Origin: origin, "Sec-Fetch-Site": "cross-site" },
		]) {
			expect(
				(
					await worker.dispatchFetch(`${api}/api/v1/auth/logout`, {
						method: "POST",
						headers,
					})
				).status,
			).toBe(403);
		}
		const response = await worker.dispatchFetch(`${api}/api/v1/auth/logout`, {
			method: "POST",
			headers: {
				Cookie: cookie,
				Origin: origin,
				"Sec-Fetch-Site": "same-site",
			},
		});
		expect(response.status).toBe(204);
		expect(response.headers.getSetCookie()).toHaveLength(2);
		expect(
			response.headers
				.getSetCookie()
				.every((value) => value.includes("Max-Age=0")),
		).toBe(true);
		expect(
			(
				await worker.dispatchFetch(`${api}/api/v1/auth/me`, {
					headers: { Cookie: cookie },
				})
			).status,
		).toBe(401);
		expect(
			(
				await worker.dispatchFetch(`${api}/api/v1/auth/logout`, {
					method: "POST",
					headers: { Origin: origin },
				})
			).status,
		).toBe(204);
	});

	it("restricts routes, methods and credentialed CORS", async () => {
		expect((await worker.dispatchFetch(`${api}/elsewhere`)).status).toBe(404);
		expect(
			(await worker.dispatchFetch(`${api}/api/v1/auth/me`, { method: "POST" }))
				.status,
		).toBe(405);
		const preflight = await worker.dispatchFetch(`${api}/api/v1/auth/logout`, {
			method: "OPTIONS",
			headers: { Origin: origin, "Access-Control-Request-Method": "POST" },
		});
		expect(preflight.status).toBe(204);
		expect(preflight.headers.get("Access-Control-Allow-Origin")).toBe(origin);
		const untrusted = await worker.dispatchFetch(`${api}/api/v1/auth/me`, {
			headers: { Origin: "https://evil.example" },
		});
		expect(untrusted.headers.get("Access-Control-Allow-Origin")).toBeNull();
	});

	it("rejects request bodies and oversized callbacks without calling GitHub", async () => {
		const body = await worker.dispatchFetch(`${api}/api/v1/auth/logout`, {
			method: "POST",
			headers: { Origin: origin },
			body: "unexpected",
		});
		expect(body.status).toBe(413);
		const oversized = await worker.dispatchFetch(
			`${api}/api/v1/auth/github/callback?code=${"x".repeat(4096)}`,
		);
		expect(oversized.status).toBe(431);
		expect(oversized.headers.getSetCookie()[0]).toContain("Max-Age=0");
		expect(providerCalls).toBe(0);
	});
});
