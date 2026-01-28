# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands

```sh
npm ci                    # Install dependencies
npm run build             # Build Firefox extension
npm run watch             # Watch mode
npm run format            # Format code with Biome
npm run lint              # Check code with Biome
npm test                  # Run linter (alias for npm run lint)
```

Build outputs go to `built/kagi_{browser}_{version}.zip`.

## Architecture

This is a monorepo containing Kagi Search browser extensions for Firefox and Safari.

### Code Sharing Model

- **`shared/`** - Common code used by both Firefox extension and old Chrome extension
  - `src/background.js` - Service worker: session token management, auth header injection, context menus
  - `src/popup.js` - Extension popup UI and settings management
  - `src/summarize_result.js` - Universal Summarizer feature
  - `src/lib/utils.js` - Shared utilities (API calls, storage, permissions)
  - `icons/` - Extension icons
- **`firefox/`** - Firefox-specific manifest only
- **`safari/`** - Separate Swift-based implementations (not part of JS build)

The build script (`build.js`) combines `shared/*` with browser-specific manifests into zip files.

### Safari Extensions

Safari extensions are Swift-based native apps, separate from the npm build system. Built with Xcode.

- **`safari/Universal/`** - Universal extension for iOS + macOS (MV3). Still under development - background scripts are unreliable and may be killed or fail to load.
- **`safari/Legacy iOS/`** - Legacy iOS implementation
- **`safari/Legacy macOS/`** - Legacy macOS implementation (minimum macOS 10.14)

The iOS extension is published at: https://apps.apple.com/us/app/kagi-search-for-safari/id1607766153

### Key APIs

- `kagi.com/api/v0/summarize` - API-based summarization
- `kagisuggest.com` - Search autocomplete

## Code Style

- Biome for linting/formatting (2-space indent, single quotes)
- Safari code is excluded from linting
- Node 20.x, npm 10.x required

## Contributing

Bugfixes and improvements are welcome. New features require prior approval via the issue tracker.
