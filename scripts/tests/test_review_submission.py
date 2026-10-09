"""Offline deterministic suggestion checks. HTTP calls are stubbed."""

import sys
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from review_submission import analyze, normalized_repo_url, parse_issue_form, report_text


def event(repo: str, official: str = 'https://example.org/') -> dict:
    return {
        'issue': {
            'labels': [{'name': 'catalog-suggestion'}],
            'body': (
                f'### Repository URL\n\n{repo}\n\n'
                '### Original software\n\nExample App\n\n'
                f'### Official software URL\n\n{official}\n\n'
                '### Notes\n\nAn independent implementation.\n'
            ),
        },
    }


def request_event(original: str = 'Example App', reason: str = 'Please recreate this app faithfully.') -> dict:
    return {
        'issue': {
            'labels': [{'name': 'project-request'}],
            'body': (
                f'### Original software\n\n{original}\n\n'
                f'### Reason\n\n{reason}\n\n'
                '### Official software URL\n\n_No response_\n'
            ),
        },
    }


class SuggestionValidationTest(unittest.TestCase):
    @patch('review_submission.collect_tools')
    @patch('review_submission.collect')
    def test_suggestion_warns_on_duplicate_tool(self, collect_mock, tools_mock):
        collect_mock.return_value = ([], [], [], [], [])
        tools_mock.return_value = ([{
            'slug': 'example-tool', 'repository': 'https://codeberg.org/acme/example',
        }], [])
        result = analyze(event('https://codeberg.org/acme/example'))
        self.assertTrue(any('Already indexed as `example-tool`' in item['message'] for item in result['findings']))

    def test_project_request_without_links_is_valid(self):
        result = analyze(request_event())
        self.assertTrue(result['applicable'])
        self.assertEqual(result['kind'], 'request')
        self.assertEqual(result['urls'], [])
        self.assertFalse(any(item['level'] == 'error' for item in result['findings']))
        body = report_text(result)
        self.assertIn('Automated Project Request review', body)
        self.assertIn('No links provided. Link validation was not required.', body)
        self.assertNotIn('Unrecognized Git provider', body)

    def test_catalog_suggestion_report_heading(self):
        result = analyze(event('https://codeberg.org/acme/example'))
        self.assertEqual(result['kind'], 'suggestion')
        self.assertIn('Automated Catalog Suggestion review', report_text(result))

    def test_request_requires_reason_not_repository(self):
        result = analyze(request_event(reason=''))
        self.assertTrue(any(item['level'] == 'error' for item in result['findings']))
        self.assertFalse(any('Repository URL' in item['message'] for item in result['findings']))

    @patch('review_submission.collect')
    def test_request_warns_when_project_already_exists(self, collect_mock):
        collect_mock.return_value = (
            [{'slug': 'example-app', 'name': 'Example App', 'aliases': []}],
            [{'slug': 'sample-implementation', 'original': 'example-app'}],
            [],
            [],
            [],
        )
        result = analyze(request_event())
        self.assertTrue(any('already indexed' in item['message'] for item in result['findings']))
        self.assertEqual(result['urls'], [])

    @patch('review_submission.collect')
    def test_request_warns_on_duplicate_request(self, collect_mock):
        collect_mock.return_value = (
            [{'slug': 'example-app', 'name': 'Example App', 'aliases': []}],
            [],
            [{'original': 'example-app', 'reason': 'Previously submitted request.'}],
            [],
            [],
        )
        result = analyze(request_event())
        self.assertTrue(any('already indexed' in item['message'] for item in result['findings']))

    def test_request_optional_valid_link_passed_to_lychee(self):
        event_data = request_event()
        event_data['issue']['body'] = event_data['issue']['body'].replace('_No response_', 'https://example.org/')
        result = analyze(event_data)
        self.assertEqual(result['urls'], ['https://example.org/'])

    def test_suggestion_still_requires_repository_url(self):
        result = analyze(event(''))
        self.assertTrue(any('repository URL' in item['message'] for item in result['findings']))

    def test_exact_heading_fields(self):
        values = parse_issue_form(event('https://codeberg.org/acme/example')['issue']['body'])
        self.assertEqual(values['Original software'], 'Example App')
        self.assertEqual(values['Repository URL'], 'https://codeberg.org/acme/example')

    def test_unrecognized_host_warns_not_fails(self):
        result = analyze(event('https://git.example.org/team/project'))
        self.assertIn('This does not link to a recognized Git provider. Proceed with caution.',
                      [entry['message'] for entry in result['findings']])
        self.assertFalse(any(entry['level'] == 'error' for entry in result['findings']))

    def test_invalid_private_address_is_rejected(self):
        result = analyze(event('https://127.0.0.1/owner/repo'))
        self.assertTrue(any(entry['level'] == 'error' for entry in result['findings']))
        self.assertNotIn('https://127.0.0.1/owner/repo', result['urls'])

    def test_provider_imitation_warns(self):
        result = analyze(event('https://github.com.evil.example/owner/repo'))
        self.assertTrue(any('recognized Git provider' in entry['message'] for entry in result['findings']))

    def test_known_provider_requires_repository_root(self):
        result = analyze(event('https://codeberg.org/team/project/issues/2'))
        self.assertTrue(any('repository root' in entry['message'] for entry in result['findings']))

    def test_gitlab_subpage_is_not_repository_root(self):
        result = analyze(event('https://gitlab.com/group/project/-/issues/12'))
        self.assertTrue(any('repository root' in entry['message'] for entry in result['findings']))

    def test_git_suffix_normalization(self):
        self.assertEqual(normalized_repo_url('https://GitHub.com/OWNER/Repo.git/'),
                         'https://github.com/owner/repo')

    def test_ignores_other_issues(self):
        other = event('https://github.com/owner/repo')
        other['issue']['labels'] = []
        self.assertFalse(analyze(other)['applicable'])

    @patch('review_submission.requests.get')
    def test_github_archived_fork_and_license_warnings(self, get):
        get.return_value = Mock(status_code=200)
        get.return_value.json.return_value = {'archived': True, 'fork': True, 'disabled': False, 'license': None}
        result = analyze(event('https://github.com/example/project'), gh_token='placeholder')
        messages = [entry['message'] for entry in result['findings']]
        self.assertTrue(any('archived' in message for message in messages))
        self.assertTrue(any('fork' in message for message in messages))
        self.assertTrue(any('license' in message for message in messages))
        self.assertIn('Bearer placeholder', get.call_args.kwargs['headers']['Authorization'])
        self.assertTrue(get.call_args.kwargs['allow_redirects'] is False)

    def test_unknown_provider_warning_is_first_and_findings_are_sorted(self):
        result = {'applicable': True, 'findings': [
            {'level': 'info', 'message': 'Checked GitHub metadata.'},
            {'level': 'warning', 'message': 'This does not link to a recognized Git provider. Proceed with caution.'},
            {'level': 'error', 'message': 'Official software URL must be a valid public HTTPS URL.'},
        ], 'urls': ['https://git.example.org/a/b']}
        body = report_text(result, links_ok=False)
        self.assertIn('> [!WARNING]', body)
        self.assertLess(body.index('**Unrecognized Git provider**'), body.index('#### Findings'))
        self.assertLess(body.index('❌ Official software URL'), body.index('✅ Checked GitHub metadata'))
        self.assertIn('1 errors | 2 warnings | 1 informational checks', body)
        self.assertIn('#### Link validation', body)
        self.assertEqual(body.count('<!-- remade-submission-review -->'), 1)

    def test_clean_report_still_requires_manual_review(self):
        result = {'applicable': True, 'findings': [
            {'level': 'info', 'message': 'Recognized Git provider: GitHub.'},
        ], 'urls': ['https://github.com/example/repo']}
        body = report_text(result, links_ok=True)
        self.assertIn('Automated checks found no problems.', body)
        self.assertIn('**Maintainer review required.**', body)
        self.assertNotIn('> [!WARNING]', body)

    def test_report_uses_explicit_warning(self):
        result = {'applicable': True, 'findings': [
            {'level': 'warning', 'message': 'This does not link to a recognized Git provider. Proceed with caution.'}
        ], 'urls': ['https://git.example.org/a/b']}
        self.assertIn('Proceed with caution.', report_text(result, links_ok=False))


if __name__ == '__main__':
    unittest.main()
