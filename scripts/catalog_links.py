"""Extract explicit, validated catalog URLs for Lychee."""

import subprocess
from pathlib import Path
from collections.abc import Iterator

import typer

from catalog import ROOT, is_https, load_yaml

app = typer.Typer(add_completion=False)


def url_values(path: Path) -> Iterator[str]:
    obj = load_yaml(path)
    for record in obj if isinstance(obj, list) else [obj]:
        if isinstance(record, dict):
            for key in ('url', 'repository', 'docs'):
                value = record.get(key)
                if is_https(value):
                    yield value


def paths_for_mode(*, all_files: bool, changed_from: str | None) -> list[Path]:
    if all_files:
        return [ROOT / 'src/content/catalog/originals.yaml',
                *(ROOT / 'src/content/catalog/projects').glob('*.yaml'),
                *(ROOT / 'src/content/catalog/tools').glob('*.yaml'),
                *(ROOT / 'src/content/catalog/requests').glob('*.yaml')]
    result = subprocess.run(
        ['git', 'diff', '--diff-filter=ACMR', '--name-only', changed_from, 'HEAD', '--', 'src/content/catalog/'],
        cwd=ROOT, text=True, check=True, capture_output=True,
    )
    paths = []
    for name in result.stdout.splitlines():
        if name == 'src/content/catalog/originals.yaml' or (
            name.startswith(('src/content/catalog/projects/', 'src/content/catalog/requests/', 'src/content/catalog/tools/')) and name.endswith('.yaml')
        ):
            path = ROOT / name
            if path.is_file() and path.resolve().is_relative_to(ROOT):
                paths.append(path)
    return paths


@app.command()
def main(
    all_files: bool = typer.Option(False, '--all', help='Read all catalog entries'),
    changed_from: str | None = typer.Option(None, '--changed-from', help='Check changed entries only'),
) -> None:
    if all_files == (changed_from is not None):
        raise typer.BadParameter('Choose exactly one of --all or --changed-from')
    values = {url for path in paths_for_mode(all_files=all_files, changed_from=changed_from)
              for url in url_values(path)}
    for url in sorted(values):
        typer.echo(url)


if __name__ == '__main__':
    app()
