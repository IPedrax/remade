import { execFileSync } from "node:child_process";

export default function setup() {
	execFileSync("worker-build", ["--release"], {
		cwd: new URL("../../../../backend/remade-api/", import.meta.url),
		stdio: "inherit",
	});
}
