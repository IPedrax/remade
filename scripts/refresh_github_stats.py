"""Daily best-effort batch refresh of cached repository metadata with GraphQL."""

import datetime as dt
import json
import os
import sys
import time
from collections.abc import Iterator
from pathlib import Path
from typing import Any

import requests
import typer

from catalog import GH_REPO, ROOT, collect

app = typer.Typer(add_completion=False)
API = 'https://api.github.com/graphql'
CACHE = ROOT / 'cache/github-metadata.json'


def batches[T](items: list[T], size: int) -> Iterator[list[T]]:
    for index in range(0, len(items), size):
        yield items[index:index + size]


def graphql_query(names: list[tuple[str, str]]) -> str:
    fields = [
        f'p{i}: repository(owner: {json.dumps(owner)}, name: {json.dumps(repo)}) {{ '
        'stargazerCount forkCount pushedAt isArchived '
        'primaryLanguage { name } licenseInfo { spdxId } }'
        for i, (owner, repo) in enumerate(names)
    ]
    return 'query RemadeMetadata { ' + ' '.join(fields) + ' rateLimit { cost remaining resetAt } }'


def call_graphql(token: str, query: str) -> dict[str, Any]:
    headers = {
        'Authorization': f'Bearer {token}',
        'Accept': 'application/vnd.github+json',
        'User-Agent': 'remade-wiki-metadata/1.0',
    }
    for attempt in range(3):
        try:
            response = requests.post(API, json={'query': query}, headers=headers, timeout=25)
            response.raise_for_status()
            return response.json()
        except (requests.RequestException, ValueError) as exc:
            status = exc.response.status_code if isinstance(exc, requests.HTTPError) and exc.response is not None else None
            if attempt == 2 or (status is not None and status not in {429, 500, 502, 503, 504}):
                raise
            time.sleep(2 ** attempt)
    raise RuntimeError('GraphQL requests exhausted')


@app.command()
def main(batch_size: int = typer.Option(25, min=1, max=50)) -> None:
    token = os.getenv('GH_METADATA_TOKEN')
    if not token:
        typer.echo('Missing GH_METADATA_TOKEN', err=True)
        raise typer.Exit(code=1)
    _, projects, _, _, errors = collect()
    if errors:
        for error in errors:
            typer.echo(error, err=True)
        raise typer.Exit(code=1)

    repositories: dict[str, tuple[str, str]] = {}
    for project in projects:
        if match := GH_REPO.fullmatch(project['repository']):
            key = f'{match.group(1)}/{match.group(2)}'.casefold()
            repositories[key] = match.group(1), match.group(2)

    current = json.loads(CACHE.read_text(encoding='utf-8')) if CACHE.exists() else {'repositories': {}}
    previous: dict[str, dict] = current.get('repositories', {})
    now = dt.datetime.now(dt.UTC).isoformat(timespec='seconds').replace('+00:00', 'Z')
    succeeded = 0
    failed = 0
    for chunk in batches(sorted(repositories.items()), batch_size):
        keys = [key for key, _ in chunk]
        names = [name for _, name in chunk]
        try:
            result = call_graphql(token, graphql_query(names))
        except (requests.RequestException, ValueError) as exc:
            typer.echo(f'WARN: batch failed ({len(keys)} entries): {exc}', err=True)
            failed += len(keys)
            continue
        data = result.get('data') or {}
        for i, key in enumerate(keys):
            item = data.get(f'p{i}')
            if not isinstance(item, dict):
                failed += 1
                continue
            previous[key] = {
                'stars': item['stargazerCount'],
                'forks': item['forkCount'],
                'primaryLanguage': (item.get('primaryLanguage') or {}).get('name'),
                'pushedAt': item.get('pushedAt'),
                'isArchived': item['isArchived'],
                'licenseSpdx': (item.get('licenseInfo') or {}).get('spdxId'),
                'fetchedAt': now,
            }
            succeeded += 1
        rate = data.get('rateLimit') or {}
        typer.echo(f"GitHub batch {len(keys)} entries; cost={rate.get('cost','?')}; remaining={rate.get('remaining','?')}")
        if result.get('errors'):
            typer.echo(f"WARN: partial GraphQL errors: {len(result['errors'])}", err=True)
        if rate.get('remaining') is not None and rate['remaining'] < 20:
            typer.echo('WARN: API rate budget low; cached records preserved', err=True)
            break

    CACHE.parent.mkdir(exist_ok=True, parents=True)
    rendered = json.dumps({'repositories': previous}, indent=2, sort_keys=True, ensure_ascii=False) + '\n'
    if not CACHE.exists() or CACHE.read_text(encoding='utf-8') != rendered:
        CACHE.write_text(rendered, encoding='utf-8')
    typer.echo(f'Updated {succeeded}; unavailable {failed}; cached {len(previous)}')
    if repositories and succeeded == 0:
        raise typer.Exit(code=1)


if __name__ == '__main__':
    app()
