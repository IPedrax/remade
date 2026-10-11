"""Review catalog suggestions and requests from GitHub Issue Forms.

Runs only trusted default-branch code. Issue bodies are untrusted data.
"""

import json
import os
import re
from pathlib import Path
from urllib.parse import urlsplit

import requests
import typer
import validators

from catalog import ROOT, collect, collect_tools, is_https

app = typer.Typer(add_completion=False, no_args_is_help=True)
MARKER = '<!-- remade-submission-review -->'
LEGACY_MARKER = '<!-- remade-suggestion-review -->'
KNOWN_PROVIDERS = {
    'github.com': 'GitHub',
    'gitlab.com': 'GitLab',
    'codeberg.org': 'Codeberg',
    'bitbucket.org': 'Bitbucket',
    'git.sr.ht': 'SourceHut',
    'gitea.com': 'Gitea',
}
REPO_PATH_PARTS = {
    'github.com': 2,
    'gitlab.com': None,  # GitLab supports namespace groups / nested groups
    'codeberg.org': 2,
    'bitbucket.org': 2,
    'git.sr.ht': 2,
    'gitea.com': 2,
}
FIELDS = {'Repository URL', 'Original software', 'Official software URL', 'Notes', 'Reason', 'What the software does'}


def parse_issue_form(body: str) -> dict[str, str]:
    """Parse the exact heading structure emitted by GitHub Issue Forms."""
    items: dict[str, str] = {}
    heading: str | None = None
    lines: list[str] = []
    for line in body.splitlines():
        match = re.fullmatch(r'### (.+)', line)
        if match:
            if heading in FIELDS:
                items[heading] = '\n'.join(lines).strip()
            heading = match.group(1)
            lines = []
        else:
            lines.append(line)
    if heading in FIELDS:
        items[heading] = '\n'.join(lines).strip()
    return items


def normalized_repo_url(value: str) -> str | None:
    if not is_https(value) or validators.url(value) is not True:
        return None
    parts = urlsplit(value)
    if parts.query or parts.fragment or parts.username or parts.password:
        return None
    if parts.path.endswith('/'):
        path = parts.path[:-1]
    else:
        path = parts.path
    if path.endswith('.git'):
        path = path[:-4]
    if not path or len(path) > 250:
        return None
    return f'https://{parts.hostname.lower()}{path}'.casefold()


def url_check(url: str, label: str) -> list[dict[str, str]]:
    findings = []
    if not is_https(url) or validators.url(url) is not True:
        findings.append({'level': 'error', 'message': f'{label} must be a valid public HTTPS URL.'})
    elif len(url) > 2048:
        findings.append({'level': 'error', 'message': f'{label} is too long.'})
    return findings


def analyze(event: dict, *, catalog_root: Path = ROOT, gh_token: str | None = None) -> dict:
    issue = event.get('issue') or {}
    labels = {label.get('name') for label in issue.get('labels', []) if isinstance(label, dict)}
    kind = 'suggestion' if 'catalog-suggestion' in labels else 'request' if 'project-request' in labels else None
    if kind is None:
        return {'applicable': False, 'findings': [], 'urls': [], 'kind': None}

    fields = parse_issue_form(issue.get('body') or '')
    repo = fields.get('Repository URL', '').strip()
    original = fields.get('Original software', '').strip()
    official = fields.get('Official software URL', '').strip()
    notes = fields.get('Notes', '')
    reason = fields.get('Reason', '').strip()
    description = fields.get('What the software does', '').strip()
    findings: list[dict[str, str]] = []

    if kind == 'suggestion':
        if not repo or repo == '_No response_' or '\n' in repo:
            findings.append({'level': 'error', 'message': 'Provide exactly one repository URL.'})
        else:
            findings.extend(url_check(repo, 'Repository URL'))
    else:
        if not description or description == '_No response_':
            findings.append({'level': 'error', 'message': 'Describe what the software does.'})
        elif len(description) < 20 or len(description) > 1000:
            findings.append({'level': 'error', 'message': 'Software description must be between 20 and 1,000 characters.'})
        if not reason or reason == '_No response_':
            findings.append({'level': 'error', 'message': 'Explain why this software should be remade.'})
        elif len(reason) < 20 or len(reason) > 1000:
            findings.append({'level': 'error', 'message': 'Reason must be between 20 and 1,000 characters.'})
    if not original or original == '_No response_':
        findings.append({'level': 'error', 'message': 'Original software name is required.'})
    elif len(original) > 120:
        findings.append({'level': 'error', 'message': 'Original software name is too long.'})
    if len(notes) > 4000:
        findings.append({'level': 'warning', 'message': 'Notes are unusually long; manual review recommended.'})
    if official and official != '_No response_':
        if '\n' in official:
            findings.append({'level': 'error', 'message': 'Official software URL must be a single URL.'})
        else:
            findings.extend(url_check(official, 'Official software URL'))

    target = normalized_repo_url(repo) if kind == 'suggestion' else None
    if kind == 'suggestion' and target and not any(item['level'] == 'error' and 'Repository URL' in item['message'] for item in findings):
        parts = urlsplit(repo)
        host = (parts.hostname or '').lower()
        provider = KNOWN_PROVIDERS.get(host)
        if provider is None:
            findings.append({'level': 'warning', 'message': 'This does not link to a recognized Git provider. Proceed with caution.'})
        else:
            path_parts = [segment for segment in parts.path.strip('/').removesuffix('.git').split('/') if segment]
            min_parts = REPO_PATH_PARTS[host]
            if min_parts is None:
                valid_path = (len(path_parts) >= 2 and '-' not in path_parts
                              and all(item not in {'.', '..'} and re.fullmatch(r'[\w.~-]+', item, re.ASCII) for item in path_parts))
            else:
                valid_path = (len(path_parts) == min_parts
                              and all(item not in {'.', '..'} and re.fullmatch(r'[\w.~-]+', item, re.ASCII) for item in path_parts))
            if not valid_path or parts.query or parts.fragment:
                findings.append({'level': 'error', 'message': f'URL does not look like a canonical {provider} repository root.'})
            else:
                findings.append({'level': 'info', 'message': f'Recognized Git provider: {provider}.'})

    # Catalog duplication needs no network access and is deterministic.
    try:
        originals, projects, request_entries, _, errors = collect(catalog_root)
        if errors:
            findings.append({'level': 'warning', 'message': 'Local catalog has validation errors; duplicate check incomplete.'})
        matching_original = next(
            (entry for entry in originals
             if original.casefold() in {
                 name.casefold() for name in [entry['name'], *entry.get('aliases', [])]
             }),
            None,
        )
        if matching_original:
            slug = matching_original['slug']
            findings.append({'level': 'info', 'message': f'Original software matches catalog entry `{slug}`.'})
            if kind == 'request':
                if any(slug in [project['original'], *project.get('additional_originals', [])] for project in projects):
                    findings.append({'level': 'warning', 'message': 'An implementation of this original is already indexed. A Project Request may be unnecessary.'})
                if any(item['original'] == slug for item in request_entries):
                    findings.append({'level': 'warning', 'message': f'A Project Request for `{slug}` is already indexed.'})
        if target:
            tools, _ = collect_tools(catalog_root)
            for project in [*projects, *tools]:
                if normalized_repo_url(project['repository']) == target:
                    findings.append({'level': 'warning', 'message': f'Already indexed as `{project["slug"]}`.'})
                    break
    except (OSError, ValueError) as exc:
        findings.append({'level': 'warning', 'message': f'Could not inspect catalog: {type(exc).__name__}.'})

    # Construct GitHub API endpoint from constrained repository components.
    # Never fetch an arbitrary issue-supplied URL with requests.
    if target and urlsplit(target).hostname == 'github.com':
        repo_parts = urlsplit(target).path.strip('/').split('/')
        if len(repo_parts) == 2 and all(re.fullmatch(r'[a-z0-9_.-]+', part) for part in repo_parts):
            api_url = f'https://api.github.com/repos/{repo_parts[0]}/{repo_parts[1]}'
            headers = {'Accept': 'application/vnd.github+json', 'User-Agent': 'remade-submission-review'}
            if gh_token:
                headers['Authorization'] = f'Bearer {gh_token}'
            try:
                response = requests.get(api_url, headers=headers, timeout=12, allow_redirects=False)
                if response.status_code == 200:
                    item = response.json()
                    if item.get('archived'):
                        findings.append({'level': 'warning', 'message': 'GitHub reports the repository is archived.'})
                    if item.get('fork'):
                        findings.append({'level': 'warning', 'message': 'GitHub reports the repository is a fork. Check the independent-reimplementation requirement.'})
                    if item.get('disabled'):
                        findings.append({'level': 'warning', 'message': 'GitHub reports the repository is disabled.'})
                    if item.get('size') == 0 and not item.get('pushed_at'):
                        findings.append({'level': 'warning', 'message': 'GitHub reports no pushed activity and a zero-size repository. Check that implementation code exists.'})
                    if not item.get('license'):
                        findings.append({'level': 'warning', 'message': 'GitHub does not report a recognized license. Review the repository manually.'})
                    findings.append({'level': 'info', 'message': 'GitHub API confirms a public repository exists.'})
                elif response.status_code == 404:
                    findings.append({'level': 'warning', 'message': 'GitHub API could not find a public repository at that path.'})
                else:
                    findings.append({'level': 'warning', 'message': f'GitHub repository metadata could not be verified (HTTP {response.status_code}).'})
            except (requests.RequestException, ValueError):
                findings.append({'level': 'warning', 'message': 'GitHub repository metadata check was inconclusive.'})

    # Lychee runs separately and uses the explicit URL list. Do not send malformed URLs.
    urls = []
    if kind == 'suggestion' and repo and not url_check(repo, 'Repository URL'):
        urls.append(repo)
    if official and official != '_No response_' and not url_check(official, 'Official software URL'):
        urls.append(official)
    return {'applicable': True, 'kind': kind, 'findings': findings, 'urls': list(dict.fromkeys(urls))}


def report_text(result: dict, *, links_ok: bool | None = None) -> str:
    """Place review warnings before routine successes in a single issue comment."""
    if not result['applicable']:
        return ''

    findings = result['findings']
    errors = [item for item in findings if item['level'] == 'error']
    warnings = [item for item in findings if item['level'] == 'warning']
    infos = [item for item in findings if item['level'] == 'info']
    unknown_provider = next(
        (item for item in warnings if item['message'].startswith('This does not link to a recognized Git provider.')),
        None,
    )
    lychee_warning = links_ok is False
    warning_count = len(warnings) + int(lychee_warning)

    title = 'Automated Project Request review' if result.get('kind') == 'request' else 'Automated Catalog Suggestion review'
    lines = [MARKER, f'### {title}', '']
    if unknown_provider:
        lines += [
            '> [!WARNING]',
            '> **Unrecognized Git provider**',
            f'> {unknown_provider["message"]}',
            '',
        ]
    elif errors:
        lines += [
            '> [!CAUTION]',
            '> **Submission requires attention.** One or more required fields failed validation.',
            '',
        ]
    elif warning_count:
        lines += [
            '> [!WARNING]',
            '> **Manual review recommended.** Automated checks found potential issues.',
            '',
        ]
    else:
        lines += [
            '> [!NOTE]',
            '> **Automated checks found no problems.** This is not an approval or safety certification.',
            '',
        ]

    lines += [
        f'**Results:** {len(errors)} errors | {warning_count} warnings | {len(infos)} informational checks',
        '',
        '#### Findings',
        '',
    ]
    for entry in [*errors, *warnings, *infos]:
        symbol = {'error': '❌', 'warning': '⚠️', 'info': '✅'}[entry['level']]
        lines.append(f'- {symbol} {entry["message"]}')
    if not findings:
        lines.append('- No additional findings.')

    lines += ['', '#### Link validation', '']
    if links_ok is True:
        lines.append('- ✅ Lychee found no broken links in the submitted URLs.')
    elif links_ok is False:
        lines.append('- ⚠️ Lychee reported a failed or inconclusive link check. Review the workflow log before accepting this suggestion.')
    else:
        lines.append('- ℹ️ No links provided. Link validation was not required.')

    lines += [
        '',
        '**Maintainer review required.** These checks do not establish independent development,',
        'legal compliance, functional compatibility, or repository safety.',
        '',
        '_This comment is updated automatically when the issue is edited or reviewed again._',
    ]
    return '\n'.join(lines)


def event_payload() -> dict:
    return json.loads(Path(os.environ['GITHUB_EVENT_PATH']).read_text(encoding='utf-8'))


@app.command()
def prepare(
    report: Path = typer.Option(..., help='Path to JSON report'),
    urls: Path = typer.Option(..., help='Path to Lychee URL list'),
) -> None:
    result = analyze(event_payload(), gh_token=os.getenv('GITHUB_TOKEN'))
    report.parent.mkdir(parents=True, exist_ok=True)
    report.write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    urls.write_text('\n'.join(result['urls']) + ('\n' if result['urls'] else ''), encoding='utf-8')
    typer.echo(f"Submission checked: {len(result['findings'])} findings, {len(result['urls'])} URLs")


@app.command()
def publish(
    report: Path = typer.Option(..., help='JSON report from prepare'),
    lychee_exit: str = typer.Option('', help='Lychee action exit code'),
) -> None:
    result = json.loads(report.read_text(encoding='utf-8'))
    if not result['applicable']:
        return
    body = report_text(result, links_ok=(lychee_exit == '0' if result['urls'] else None))
    repo = os.environ['GITHUB_REPOSITORY']
    if not re.fullmatch(r'[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+', repo):
        raise typer.BadParameter('Invalid GITHUB_REPOSITORY')
    issue_number = int(event_payload()['issue']['number'])
    token = os.environ['GITHUB_TOKEN']
    endpoint = f'https://api.github.com/repos/{repo}/issues/{issue_number}/comments'
    headers = {'Authorization': f'Bearer {token}', 'Accept': 'application/vnd.github+json',
               'User-Agent': 'remade-submission-review'}
    existing = None
    # The comments endpoint paginates oldest-first. Search later pages rather
    # than accidentally creating a second review comment on busy issues.
    for page in range(1, 11):
        response = requests.get(
            endpoint, params={'per_page': 100, 'page': page}, headers=headers, timeout=15,
        )
        response.raise_for_status()
        comments = response.json()
        existing = next(
            (comment for comment in comments
             if any(marker in (comment.get('body') or '') for marker in (MARKER, LEGACY_MARKER))
             and comment.get('user', {}).get('type') == 'Bot'),
            None,
        )
        if existing or len(comments) < 100:
            break
    else:
        raise RuntimeError('Too many issue comments to locate the existing review safely.')
    if existing:
        reply = requests.patch(existing['url'], json={'body': body}, headers=headers, timeout=15)
    else:
        reply = requests.post(endpoint, json={'body': body}, headers=headers, timeout=15)
    reply.raise_for_status()
    typer.echo('Updated automated issue review comment.')


if __name__ == '__main__':
    app()
