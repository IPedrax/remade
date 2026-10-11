"""Validate catalog entries before merge or build."""

import typer

from catalog import collect

app = typer.Typer(add_completion=False)


@app.command()
def main() -> None:
    originals, projects, requests, featured, errors = collect()
    if errors:
        for error in errors:
            typer.echo(f"ERROR: {error}", err=True)
        typer.echo(f"Catalog invalid: {len(errors)} problem(s)", err=True)
        raise typer.Exit(code=1)
    typer.echo(
        f"Catalog valid: {len(originals)} originals, {len(projects)} projects, "
        f"{len(requests)} requests, {len(featured)} featured"
    )


if __name__ == "__main__":
    app()
