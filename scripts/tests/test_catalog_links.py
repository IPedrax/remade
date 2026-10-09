import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock, patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from catalog_links import paths_for_mode, url_values


class ToolLinksTest(unittest.TestCase):
    def test_tools_included_in_full_and_changed_catalog_checks(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            directory = root / 'src/content/catalog/tools/daijro'
            directory.mkdir(parents=True)
            path = directory / 'launcher.yaml'
            path.write_text('repository: https://github.com/example/launcher\nurl: https://example.org/launcher\n')
            with patch('catalog_links.ROOT', root):
                self.assertIn(path, paths_for_mode(all_files=True, changed_from=None))
                result = Mock(stdout='src/content/catalog/tools/daijro/launcher.yaml\n')
                with patch('catalog_links.subprocess.run', return_value=result):
                    self.assertEqual(paths_for_mode(all_files=False, changed_from='base'), [path])
            self.assertEqual(set(url_values(path)), {
                'https://github.com/example/launcher', 'https://example.org/launcher',
            })
