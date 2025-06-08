# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `pnpm dev` - Start development with hot reload (Chrome)
- `pnpm dev:firefox` - Start development for Firefox
- `pnpm build` - Production build (Chrome)
- `pnpm build:firefox` - Production build for Firefox
- `pnpm type-check` - Run TypeScript type checking across all packages

### Testing and Quality
- `pnpm e2e` - Build and run end-to-end tests (Chrome)
- `pnpm e2e:firefox` - Build and run end-to-end tests (Firefox)
- `pnpm lint` - Run ESLint with auto-fix
- `pnpm prettier` - Format code with Prettier

### Package Management
- `pnpm zip` - Build and package extension for distribution (Chrome)
- `pnpm zip:firefox` - Build and package extension for distribution (Firefox)
- `pnpm module-manager` - Enable/disable extension modules interactively
- `pnpm clean` - Clean all build artifacts and node_modules

### Installing Dependencies
- `pnpm i <package> -w` - Install dependency for root workspace
- `pnpm i <package> -F <module-name>` - Install dependency for specific module (e.g., `content-ui`, `popup`)

## Architecture

### Monorepo Structure
This is a **Chrome/Firefox extension** built as a **pnpm monorepo** with **Turborepo** orchestration. The project uses:
- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS v4** for styling
- **Manifest V3** for Chrome extensions

### Key Directories

**`/chrome-extension/`** - Core extension configuration
- `manifest.ts` - Generates manifest.json for both Chrome and Firefox
- `src/background/` - Service worker handling CORS and AI API requests
- `public/` - Static assets (icons, content CSS)

**`/pages/`** - Extension UI components (each is a separate workspace)
- `content-ui/` - React UI injected into websites (main AI discussion interface)
- `content/` - Base content scripts
- `content-runtime/` - Injectable runtime scripts
- `popup/`, `options/`, `new-tab/`, `side-panel/` - Standard extension pages
- `devtools/`, `devtools-panel/` - Browser DevTools integration
- `background/` - Background service worker functionality

**`/packages/`** - Shared libraries and utilities
- `shared/` - Common utilities, hooks, components
- `ui/` - Reusable UI components
- `storage/` - Chrome extension storage helpers
- `vite-config/`, `tsconfig/`, `tailwind-config/` - Build configurations
- `i18n/` - Internationalization with type safety
- `hmr/` - Custom Hot Module Reload for extension development

### Extension Architecture
- **Target**: Google Voice integration with AI-powered discussion features
- **AI Integration**: Local Ollama models (privacy-first, no external APIs)
- **Permissions**: Targets `voice.google.com` and `localhost:11434` (Ollama API)
- **Cross-browser**: Chrome and Firefox support via manifest generation

### Development Workflow
1. **Content Scripts**: Inject AI UI into Google Voice conversations
2. **Background Service**: Handles CORS requests to local Ollama API
3. **Message Passing**: Communication between content scripts and background
4. **Hot Reload**: Custom HMR system for rapid extension development

### Build System
- **Turborepo**: Orchestrates builds across all packages in parallel
- **Environment Variables**: CLI flags control Chrome vs Firefox builds (`CLI_CEB_FIREFOX=true`)
- **Module Management**: Use `pnpm module-manager` to enable/disable extension features
- **Testing**: WebDriverIO e2e tests for both browsers

## Development Notes

### Node Version
Requires Node.js >= 22.12.0 (use `.nvmrc` file)

### Windows Setup
Run these commands before development:
```bash
git config --global core.eol lf
git config --global core.autocrlf input
```

### Extension Loading
- **Chrome**: Load `dist/` folder via Developer mode
- **Firefox**: Load `dist/manifest.json` as temporary add-on

### AI Integration
- Extension communicates with local Ollama API at `localhost:11434`
- Background script handles CORS for AI API requests
- No external AI services used (privacy-focused)