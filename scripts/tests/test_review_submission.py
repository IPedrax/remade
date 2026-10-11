"""Offline deterministic suggestion checks. HTTP calls are stubbed."""

from unittest.mock import Mock

import pytest

from review_submission import analyze, normalized_repo_url, parse_issue_form, report_text


def event(repo: str, official: str='https://example.org/') -> dict:
    return {'issue': {'labels': [{'name': 'catalog-suggestion'}], 'body': f'### Repository URL\n\n{repo}\n\n### Original software\n\nExample App\n\n### Official software URL\n\n{official}\n\n### Notes\n\nAn independent implementation.\n'}}


def request_event(original: str='Example App', reason: str='Please recreate this app faithfully.', description: str='An editor for creating and arranging illustrations.') -> dict:
    return {'issue': {'labels': [{'name': 'project-request'}], 'body': f'### Original software\n\n{original}\n\n### What the software does\n\n{description}\n\n### Reason\n\n{reason}\n\n### Official software URL\n\n_No response_\n'}}


@pytest.mark.parametrize('description', ['', '_No response_', 'Too short', 'x' * 1001])
def test_request_requires_valid_software_description(description: str) -> None:
    result = analyze(request_event(description=description))
    assert any(item['level'] == 'error' and ('software does' in item['message'] or 'Software description' in item['message']) for item in result['findings'])


def test_request_parses_description_separately_from_reason() -> None:
    fields = parse_issue_form(request_event()['issue']['body'])
    assert fields['What the software does'] == 'An editor for creating and arranging illustrations.'
    assert fields['Reason'] == 'Please recreate this app faithfully.'


def test_suggestion_warns_on_duplicate_tool(monkeypatch: pytest.MonkeyPatch) -> None:
    collect_mock = Mock()
    monkeypatch.setattr('review_submission.collect', collect_mock)
    tools_mock = Mock()
    monkeypatch.setattr('review_submission.collect_tools', tools_mock)
    collect_mock.return_value = ([], [], [], [], [])
    tools_mock.return_value = ([{'slug': 'example-tool', 'repository': 'https://codeberg.org/acme/example'}], [])
    result = analyze(event('https://codeberg.org/acme/example'))
    assert any(('Already indexed as `example-tool`' in item['message'] for item in result['findings']))


def test_project_request_without_links_is_valid() -> None:
    result = analyze(request_event())
    assert result['applicable']
    assert result['kind'] == 'request'
    assert result['urls'] == []
    assert not any((item['level'] == 'error' for item in result['findings']))
    body = report_text(result)
    assert 'Automated Project Request review' in body
    assert 'No links provided. Link validation was not required.' in body
    assert 'Unrecognized Git provider' not in body


def test_catalog_suggestion_report_heading() -> None:
    result = analyze(event('https://codeberg.org/acme/example'))
    assert result['kind'] == 'suggestion'
    assert 'Automated Catalog Suggestion review' in report_text(result)


def test_request_requires_reason_not_repository() -> None:
    result = analyze(request_event(reason=''))
    assert any((item['level'] == 'error' for item in result['findings']))
    assert not any(('Repository URL' in item['message'] for item in result['findings']))


def test_request_warns_when_project_already_exists(monkeypatch: pytest.MonkeyPatch) -> None:
    collect_mock = Mock()
    monkeypatch.setattr('review_submission.collect', collect_mock)
    collect_mock.return_value = ([{'slug': 'example-app', 'name': 'Example App', 'aliases': []}], [{'slug': 'sample-implementation', 'originals': ['example-app']}], [], [], [])
    result = analyze(request_event())
    assert any(('already indexed' in item['message'] for item in result['findings']))


def test_request_warns_when_additional_target_already_exists(monkeypatch: pytest.MonkeyPatch) -> None:
    collect_mock = Mock(return_value=([{'slug': 'example-app', 'name': 'Example App'}], [{'slug': 'multi', 'originals': ['another-app', 'example-app']}], [], [], []))
    monkeypatch.setattr('review_submission.collect', collect_mock)
    result = analyze(request_event())
    assert any('already indexed' in item['message'] for item in result['findings'])
    assert result['urls'] == []


def test_request_warns_on_duplicate_request(monkeypatch: pytest.MonkeyPatch) -> None:
    collect_mock = Mock()
    monkeypatch.setattr('review_submission.collect', collect_mock)
    collect_mock.return_value = ([{'slug': 'example-app', 'name': 'Example App', 'aliases': []}], [], [{'original': 'example-app', 'reason': 'Previously submitted request.'}], [], [])
    result = analyze(request_event())
    assert any(('already indexed' in item['message'] for item in result['findings']))


def test_request_optional_valid_link_passed_to_lychee() -> None:
    event_data = request_event()
    event_data['issue']['body'] = event_data['issue']['body'].replace('_No response_', 'https://example.org/')
    result = analyze(event_data)
    assert result['urls'] == ['https://example.org/']


def test_suggestion_still_requires_repository_url() -> None:
    result = analyze(event(''))
    assert any(('repository URL' in item['message'] for item in result['findings']))


def test_exact_heading_fields() -> None:
    values = parse_issue_form(event('https://codeberg.org/acme/example')['issue']['body'])
    assert values['Original software'] == 'Example App'
    assert values['Repository URL'] == 'https://codeberg.org/acme/example'


def test_unrecognized_host_warns_not_fails() -> None:
    result = analyze(event('https://git.example.org/team/project'))
    assert 'This does not link to a recognized Git provider. Proceed with caution.' in [entry['message'] for entry in result['findings']]
    assert not any((entry['level'] == 'error' for entry in result['findings']))


def test_invalid_private_address_is_rejected() -> None:
    result = analyze(event('https://127.0.0.1/owner/repo'))
    assert any((entry['level'] == 'error' for entry in result['findings']))
    assert 'https://127.0.0.1/owner/repo' not in result['urls']


def test_provider_imitation_warns() -> None:
    result = analyze(event('https://github.com.evil.example/owner/repo'))
    assert any(('recognized Git provider' in entry['message'] for entry in result['findings']))


def test_known_provider_requires_repository_root() -> None:
    result = analyze(event('https://codeberg.org/team/project/issues/2'))
    assert any(('repository root' in entry['message'] for entry in result['findings']))


def test_gitlab_subpage_is_not_repository_root() -> None:
    result = analyze(event('https://gitlab.com/group/project/-/issues/12'))
    assert any(('repository root' in entry['message'] for entry in result['findings']))


def test_git_suffix_normalization() -> None:
    assert normalized_repo_url('https://GitHub.com/OWNER/Repo.git/') == 'https://github.com/owner/repo'


def test_ignores_other_issues() -> None:
    other = event('https://github.com/owner/repo')
    other['issue']['labels'] = []
    assert not analyze(other)['applicable']


def test_github_archived_fork_and_license_warnings(monkeypatch: pytest.MonkeyPatch) -> None:
    get = Mock()
    monkeypatch.setattr('review_submission.requests.get', get)
    get.return_value = Mock(status_code=200)
    get.return_value.json.return_value = {'archived': True, 'fork': True, 'disabled': False, 'license': None}
    result = analyze(event('https://github.com/example/project'), gh_token='placeholder')
    messages = [entry['message'] for entry in result['findings']]
    assert any(('archived' in message for message in messages))
    assert any(('fork' in message for message in messages))
    assert any(('license' in message for message in messages))
    assert 'Bearer placeholder' in get.call_args.kwargs['headers']['Authorization']
    assert get.call_args.kwargs['allow_redirects'] is False


def test_unknown_provider_warning_is_first_and_findings_are_sorted() -> None:
    result = {'applicable': True, 'findings': [{'level': 'info', 'message': 'Checked GitHub metadata.'}, {'level': 'warning', 'message': 'This does not link to a recognized Git provider. Proceed with caution.'}, {'level': 'error', 'message': 'Official software URL must be a valid public HTTPS URL.'}], 'urls': ['https://git.example.org/a/b']}
    body = report_text(result, links_ok=False)
    assert '> [!WARNING]' in body
    assert body.index('**Unrecognized Git provider**') < body.index('#### Findings')
    assert body.index('❌ Official software URL') < body.index('✅ Checked GitHub metadata')
    assert '1 errors | 2 warnings | 1 informational checks' in body
    assert '#### Link validation' in body
    assert body.count('<!-- remade-submission-review -->') == 1


def test_clean_report_still_requires_manual_review() -> None:
    result = {'applicable': True, 'findings': [{'level': 'info', 'message': 'Recognized Git provider: GitHub.'}], 'urls': ['https://github.com/example/repo']}
    body = report_text(result, links_ok=True)
    assert 'Automated checks found no problems.' in body
    assert '**Maintainer review required.**' in body
    assert '> [!WARNING]' not in body


def test_report_uses_explicit_warning() -> None:
    result = {'applicable': True, 'findings': [{'level': 'warning', 'message': 'This does not link to a recognized Git provider. Proceed with caution.'}], 'urls': ['https://git.example.org/a/b']}
    assert 'Proceed with caution.' in report_text(result, links_ok=False)
