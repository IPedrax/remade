from pathlib import Path
from unittest.mock import Mock

import pytest

from catalog_links import paths_for_mode, url_values


def test_tools_included_in_full_and_changed_catalog_checks(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch,
) -> None:
    directory = tmp_path / 'src/content/catalog/tools/daijro'
    directory.mkdir(parents=True)
    path = directory / 'launcher.yaml'
    path.write_text(
        'repository: https://github.com/example/launcher\n'
        'url: https://example.org/launcher\n'
    )
    monkeypatch.setattr('catalog_links.ROOT', tmp_path)
    assert path in paths_for_mode(all_files=True, changed_from=None)
    run = Mock(return_value=Mock(stdout='src/content/catalog/tools/daijro/launcher.yaml\n'))
    monkeypatch.setattr('catalog_links.subprocess.run', run)
    assert paths_for_mode(all_files=False, changed_from='base') == [path]
    assert set(url_values(path)) == {
        'https://github.com/example/launcher',
        'https://example.org/launcher',
    }
