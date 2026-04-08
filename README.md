# Csound IDE — Puppeteer Test Suite

Automated browser tests for [ide.csound.com](https://ide.csound.com) using [Puppeteer](https://pptr.dev).

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Create your local config
cp .env.example .env

# 3. (Optional) Edit .env to point at a local dev server or change settings

# 4. Run all tests
npm test
```

That's it. The default `.env` targets the hosted IDE — no extra setup needed.

## Project Structure

```text
├── tests/
│   ├── runner.js          ← runs all suites, prints aggregate results
│   ├── 01-page-load.js    ← page load, title, basic DOM structure
│   ├── 02-editor.js       ← editor typing, undo, syntax highlighting
│   ├── 03-playback.js     ← Run / Stop buttons, output console
│   └── 04-file-mgmt.js    ← file tabs, sidebar, URL stability
├── utils/
│   ├── browser.js         ← Puppeteer launch / page helpers
│   └── reporter.js        ← pass/fail/skip console reporter
├── .env.example           ← template — copy to .env
├── eslint.config.js
└── package.json
```

## Prerequisites

| Requirement           | Notes                                                                            |
| --------------------- | -------------------------------------------------------------------------------- |
| **Node.js** ≥ 18      | `node -v` to verify                                                              |
| **Chrome / Chromium** | Auto-detected on macOS & Linux; see [Browser Setup](#browser-setup) if not found |

## Environment Variables

All configuration lives in a `.env` file (git-ignored). Copy the template and adjust as needed:

```bash
cp .env.example .env
```

| Variable                    | Default                                              | Description                                                       |
| --------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------- |
| `IDE_BASE_URL`              | `https://ide.csound.com`                             | Site root — used by the page-load suite                           |
| `IDE_PROJECT_URL`           | `https://ide.csound.com/editor/jQiIAlDXxe4KEPDTllii` | Editable project — used by editor, playback, and file-mgmt suites |
| `PUPPETEER_EXECUTABLE_PATH` | _(auto-detect)_                                      | Explicit path to a Chrome/Chromium binary                         |
| `HEADLESS`                  | `true`                                               | Set to `false` to open a visible browser (useful for debugging)   |

### Targeting a Local Dev Server

```bash
IDE_BASE_URL=http://localhost:3000
IDE_PROJECT_URL=http://localhost:3000/editor/jQiIAlDXxe4KEPDTllii
```

## Running Tests

```bash
# All suites
npm test

# Individual suites
npm run test:page-load
npm run test:editor
npm run test:playback

# Or directly
node tests/01-page-load.js
node tests/02-editor.js
node tests/03-playback.js
node tests/04-file-mgmt.js

# Debug mode — open a visible browser window
HEADLESS=false npm test
```

## Test Suites

| Suite              | What it checks                                                                   |
| ------------------ | -------------------------------------------------------------------------------- |
| **01 — Page Load** | IDE navigates, title is set, no JS errors, editor + run button present           |
| **02 — Editor**    | Click into editor, type Csound code, verify content, Ctrl+Z, syntax highlighting |
| **03 — Playback**  | Run button found, click doesn't crash the page, console output area, Stop button |
| **04 — File Mgmt** | File tab visible, new-file control, sidebar, URL stability, screenshot           |

## Browser Setup

The test helper auto-detects Chrome/Chromium from common install paths. If detection fails:

```bash
# Option A — install via Puppeteer's browser manager
npx @puppeteer/browsers install chrome@stable

# Then point the tests at it
PUPPETEER_EXECUTABLE_PATH=/path/to/chrome

# Option B — use your system Chrome (macOS example)
PUPPETEER_EXECUTABLE_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

Add the path to your `.env` so you don't have to set it every time.

## Adapting Selectors

The IDE is a React app — CSS class names may change between deployments.
If a test fails with "selector not found", inspect the element in Chrome DevTools and update the selector in the relevant test file.

Common patterns:

- **Monaco**: `.monaco-editor .inputarea`, `.view-lines`
- **CodeMirror**: `.CodeMirror`, `.CodeMirror-code`
- **Buttons**: `button[aria-label*="run" i]`, `button[title*="play" i]`

## Code Quality

This project uses **ESLint**, **Prettier**, and **Husky** (with lint-staged) to enforce consistent style on every commit.

```bash
npm run lint        # check for issues
npm run lint:fix    # auto-fix
npm run format      # format with Prettier
```

## Exit Code

The runner exits `1` on any failure, `0` on all-pass — suitable for CI pipelines.
