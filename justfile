# Run recipes from the repository root, preserving argument quoting.

set positional-arguments := true

mod py "scripts/justfile"

# Show available commands.
default:
    @just --list

# Start the Astro development server.
dev *args:
    pnpm dev "$@"

# Build the static site and Pagefind index.
build *args:
    pnpm build "$@"

# Preview the production build.
preview *args:
    pnpm preview "$@"

# Run the Astro CLI.
astro *args:
    pnpm astro "$@"

# Check frontend types.
check *args:
    pnpm check "$@"

# Format frontend source with Biome.
format *args:
    pnpm format "$@"

# Run all frontend suites (unit, component and E2E).
test *args:
    pnpm test "$@"

# Run frontend unit tests.
test-unit *args:
    pnpm test:unit "$@"

# Run React component tests in Chromium.
test-react *args:
    pnpm test:react "$@"

# Build and run production E2E tests.
test-e2e *args:
    pnpm test:e2e "$@"

# Install or refresh local commit hooks.
hooks-install:
    pnpm exec lefthook install
