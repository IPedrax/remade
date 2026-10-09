import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from catalog import collect, collect_tools


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

    def test_request_suggested_names_validation(self):
        self.add_original()
        path = self.root / 'src/content/catalog/requests/product-a.yaml'
        for names, valid in [
            ('[MusicCraft, SoundCraft]', True),
            ('[]', False),
            ('MusicCraft', False),
            ('[null]', False),
            ('["<b>name</b>"]', False),
            ('["MusicCraft", " musiccraft "]', False),
            ('["A"]', False),
            ('["' + 'a' * 101 + '"]', False),
        ]:
            with self.subTest(names=names):
                path.write_text('original: product-a\nreason: A faithful implementation would be useful.\nsuggested_names: ' + names + '\n')
                self.assertEqual(not collect(self.root)[-1], valid)

    def add_tool(self):
        directory = self.root / 'src/content/catalog/tools'
        directory.mkdir(exist_ok=True)
        path = directory / 'example-tool.yaml'
        path.write_text('''
slug: example-tool
name: Example Tool
repository: https://github.com/example/example-tool
url: https://example.org/tool
description: A browser launcher for the indexed implementation.
projects: [impl-a]
''')
        return path

    def test_tool_can_be_featured_without_counting_as_project(self):
        self.add_original()
        self.add_project()
        self.add_tool()
        (self.root / 'src/content/catalog/featured.yaml').write_text('- example-tool\n')
        _, projects, _, featured, errors = collect(self.root)
        self.assertFalse(errors)
        self.assertEqual([project['slug'] for project in projects], ['impl-a'])
        self.assertEqual(featured, ['example-tool'])
        tools, errors = collect_tools(self.root)
        self.assertFalse(errors)
        self.assertEqual(tools[0]['slug'], 'example-tool')

    def test_tool_requires_existing_project(self):
        self.add_tool()
        self.assertTrue(any('unknown project impl-a' in error for error in collect(self.root)[-1]))

    def test_tool_rejects_invalid_input(self):
        self.add_original()
        self.add_project()
        for old, new in [
            ('projects: [impl-a]', 'projects: []'),
            ('projects: [impl-a]', 'projects: [impl-a, impl-a]'),
            ('projects: [impl-a]', 'projects: [null]'),
            ('url: https://example.org/tool', 'url: https://127.0.0.1/tool'),
            ('https://github.com/example/example-tool', 'https://github.com/example/example-tool/issues'),
            ('slug: example-tool', 'slug: different-slug'),
            ('name: Example Tool', 'name: "<b>Tool</b>"'),
            ('name: Example Tool', 'name: Example Tool\nextra: unexpected'),
        ]:
            with self.subTest(new=new):
                path = self.add_tool()
                path.write_text(path.read_text().replace(old, new))
                self.assertTrue(collect(self.root)[-1])

    def test_tools_share_project_slug_and_repository_namespace(self):
        self.add_original()
        self.add_project()
        path = self.add_tool()
        path.write_text(path.read_text().replace('https://github.com/example/example-tool', 'https://github.com/EXAMPLE/IMPL-A'))
        self.assertTrue(any('repository already used' in error for error in collect(self.root)[-1]))
        path = self.add_tool()
        path.write_text(path.read_text().replace('slug: example-tool', 'slug: impl-a'))
        path.rename(path.with_name('impl-a.yaml'))
        self.assertTrue(any('slug already used' in error for error in collect(self.root)[-1]))

    def test_duplicate_tool_repositories_rejected(self):
        self.add_original()
        self.add_project()
        path = self.add_tool()
        path.with_name('another-tool.yaml').write_text(path.read_text().replace('slug: example-tool', 'slug: another-tool'))
        self.assertTrue(any('duplicate repository' in error for error in collect(self.root)[-1]))

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
