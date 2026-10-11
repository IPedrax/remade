"""Check the PR acknowledgment without evaluating untrusted PR text as code."""

import json
import os
import re
from pathlib import Path

import typer

app = typer.Typer(add_completion=False)


@app.command()
def main() -> None:
    if not (path := os.getenv("GITHUB_EVENT_PATH")):
        typer.echo("GITHUB_EVENT_PATH missing", err=True)
        raise typer.Exit(code=1)
    payload = json.loads(Path(path).read_text(encoding="utf-8"))
    body = (payload.get("pull_request") or {}).get("body") or ""
    accepted = re.search(
        r"^-\s*\[[xX]\]\s+I have read and will adhere to\s+\[POLICY\.md\]", body, re.M
    )
    if not accepted:
        typer.echo("Required checkbox missing: I have read and will adhere to POLICY.md", err=True)
        raise typer.Exit(code=1)
    typer.echo("POLICY.md acknowledgment checked")


if __name__ == "__main__":
    app()
