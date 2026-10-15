from collections.abc import Callable
from pathlib import Path

import pytest
import yaml

from catalog import collect, collect_suites, collect_tools


def write_suite(root: Path, source: str | None = None) -> Path:
    directory = root / "apps/frontend/remade-wiki/src/content/catalog/suites"
    directory.mkdir(exist_ok=True)
    path = directory / "test-suite.yaml"
    path.write_text(
        source
        if source is not None
        else "slug: test-suite\nname: Test Suite\ndescription: A suite of related software projects.\nprojects: [impl-a]\n"
    )
    return path


def test_suite_only_and_mixed_tools(
    project_catalog: Path, tool_factory: Callable[[], Path]
) -> None:
    write_suite(project_catalog)
    path = tool_factory()
    tool = yaml.safe_load(path.read_text())
    tool.pop("projects")
    tool["suites"] = ["test-suite"]
    path.write_text(yaml.safe_dump(tool))

    assert not collect(project_catalog)[-1]
    assert collect_tools(project_catalog)[0][0]["projects"] == []

    tool["projects"] = ["impl-a"]
    path.write_text(yaml.safe_dump(tool))

    assert not collect(project_catalog)[-1]


@pytest.mark.parametrize(
    "value",
    ["[]", "null", "test-suite", "[null]", "[Invalid]", "[test-suite, test-suite]", "[missing]"],
)
def test_invalid_tool_suites(
    project_catalog: Path, tool_factory: Callable[[], Path], value: str
) -> None:
    write_suite(project_catalog)
    path = tool_factory()
    path.write_text(path.read_text() + f"suites: {value}\n")

    assert collect(project_catalog)[-1]


def test_tool_requires_a_target(project_catalog: Path, tool_factory: Callable[[], Path]) -> None:
    path = tool_factory()
    path.write_text(path.read_text().replace("projects: [impl-a]\n", ""))

    assert any("project or suite reference" in error for error in collect(project_catalog)[-1])


@pytest.mark.parametrize(
    "replacement", ["[]", "[impl-a, impl-a]", "[missing]", "[null]", "[test-suite]"]
)
def test_invalid_suite_members(project_catalog: Path, replacement: str) -> None:
    path = write_suite(project_catalog)
    path.write_text(path.read_text().replace("[impl-a]", replacement))

    assert collect(project_catalog)[-1]


@pytest.mark.parametrize(
    "source", ["[]", "slug: test-suite", "slug: test-suite\nslug: other", "!execute dangerous"]
)
def test_malformed_suites(project_catalog: Path, source: str) -> None:
    write_suite(project_catalog, source)

    assert collect_suites(project_catalog)[1]


def test_suite_identity_and_duplicate_names(project_catalog: Path) -> None:
    path = write_suite(project_catalog)
    other = path.with_name("other.yaml")
    other.write_text(path.read_text())

    assert collect(project_catalog)[-1]

    other.write_text(path.read_text().replace("slug: test-suite", "slug: other"))

    assert any("duplicate suite name" in error for error in collect(project_catalog)[-1])


def test_suite_does_not_fulfill_a_request(original_catalog: Path) -> None:
    write_suite(original_catalog)

    assert any("unknown project impl-a" in error for error in collect(original_catalog)[-1])
