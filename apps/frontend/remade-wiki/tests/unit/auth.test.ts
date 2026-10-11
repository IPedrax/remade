import { describe, expect, it } from "vitest";
import { hasLoginHint } from "../../src/lib/auth";

describe("login hint", () => {
	it.each(["", "other=1", "remade_login_hint=0", "not_remade_login_hint=1"])(
		"does not detect authentication from %s",
		(cookies) => {
			expect(hasLoginHint(cookies)).toBe(false);
		},
	);

	it("recognizes the exact non-secret hint among other cookies", () => {
		expect(hasLoginHint("other=1; remade_login_hint=1; extra=2")).toBe(true);
	});
});
