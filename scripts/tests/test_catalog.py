import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from catalog import collect


class CatalogValidationTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        for sub in ('src/content/catalog/projects', 'src/content/catalog/requests'):
            (self.root / sub).mkdir(parents=True)
        (self.root / 'src/content/catalog/originals.yaml').write_text('[]\n')
        (self.root / 'src/content/catalog/featured.yaml').write_text('[]\n')

    def add_original(self):
        (self.root / 'src/content/catalog/originals.yaml').write_text('''
- slug: product-a
  name: Product A
  url: https://example.com/product-a
  category: applications
''')

    def add_project(self):
        (self.root / 'src/content/catalog/projects/impl-a.yaml').write_text('''
slug: impl-a
name: Implementation A
repository: https://github.com/example/impl-a
original: product-a
category: applications
languages: [Rust]
status: experimental
compatibility: targeting
description: An independent implementation of a public software interface.
license: MIT
''')

    def test_empty_catalog_valid(self):
        self.assertFalse(collect(self.root)[-1])

    def test_request_valid_when_no_project(self):
        self.add_original()
        (self.root / 'src/content/catalog/requests/product-a.yaml').write_text('''
original: product-a
reason: An independently authored compatible implementation would be useful.
''')
        self.assertFalse(collect(self.root)[-1])

    def test_request_cannot_coexist_with_project(self):
        self.add_original()
        self.add_project()
        (self.root / 'src/content/catalog/requests/product-a.yaml').write_text('''
original: product-a
reason: An independently authored compatible implementation would be useful.
''')
        self.assertTrue(any('already fulfilled' in x for x in collect(self.root)[-1]))

    def test_project_and_featured_valid(self):
        self.add_original()
        self.add_project()
        (self.root / 'src/content/catalog/featured.yaml').write_text('- impl-a\n')
        self.assertFalse(collect(self.root)[-1])

    def test_disallow_untrusted_private_url(self):
        self.add_original()
        (self.root / 'src/content/catalog/originals.yaml').write_text(
            (self.root / 'src/content/catalog/originals.yaml').read_text().replace('https://example.com/product-a', 'https://127.0.0.1/api'))
        self.assertTrue(any('public HTTPS' in x for x in collect(self.root)[-1]))

    def test_duplicate_yaml_keys_rejected(self):
        self.add_original()
        (self.root / 'src/content/catalog/requests/product-a.yaml').write_text('''
original: product-a
original: product-b
reason: An independent compatible implementation would be useful.
''')
        self.assertTrue(any('Duplicate YAML key' in x for x in collect(self.root)[-1]))


if __name__ == '__main__':
    unittest.main()
