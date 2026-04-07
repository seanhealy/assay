# AGENTS.md

## Tech Stack

- **Language:** TypeScript
- **Build:** [tsdown](https://tsdown.dev/) (ESM + dts)
- **Template Engine:** [LiquidJS](https://liquidjs.com/)
- **Test Runner:** [Vitest](https://vitest.dev/) (Browser Mode)
- **Browser Automation:** [Playwright](https://playwright.dev/)
- **Linter/Formatter:** [Biome](https://biomejs.dev/) for JS/TS/CSS/JSON
- **Formatter (MD/HTML):** [Prettier](https://prettier.io/)
- **Node version manager:** [Volta](https://volta.sh/)

## Project Structure

```
src/
├── index.ts              # Barrel export
├── preset.ts             # Vitest config preset
├── plugin.ts             # Vite plugin, serves .liquid files
├── fs-adapter.ts         # Custom LiquidJS fs using fetch
├── render.ts             # render helper
├── filters.ts            # Shopify filter mocks
└── types.ts              # Config type definitions
```

## Coding Conventions

- **Indentation:** Tabs (not spaces)
- **Line width:** 80 columns
- **Imports:** Auto-organized by Biome
- Prefer named exports over default exports
- Use `function` declarations, not arrow functions
- **Function ordering:** Most important first, helpers last. Exported/primary
  functions at the top, internal helpers below.
- **Variable naming:** Use full words, not abbreviations (e.g., `action` not
  `fn`, `context` not `ctx`).
- **Directory modules:** When a module grows into a directory, use `index.ts` as
  a barrel export only. Implementation lives in a named file.
- **Object/interface properties:** Order by importance, not alphabetically.
  Group related properties. Identifying fields first, core fields next,
  optional/metadata fields last.
- **Use `undefined`, not `null`.** Prefer `undefined` throughout the codebase
  for absent values.

## Commands

| Command          | Description                  |
| ---------------- | ---------------------------- |
| `npm run build`  | Build package (tsdown)       |
| `npm run verify` | Lint, format, and type-check |

## Before Submitting Changes

1. Run `npm run verify` to lint, format, and type-check
2. Run `npm run build` to verify the project compiles without errors
