# Technical Spec

Internal design notes. For usage, see [README.md](../README.md).

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Consumer Test File                 │
│                                                     │
│  render('button', { text: 'Click me' })             │
│  page.getByRole('button') / userEvent.click(...)    │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│                   render                            │
│                                                     │
│  1. Get or create LiquidJS engine                   │
│  2. Render .liquid file → HTML string               │
│  3. Activate <script> tags                          │
│  4. Inject HTML into live browser DOM               │
│  5. Wait for custom elements (if specified)         │
│  6. Return container element                        │
└───────┬──────────────────────┬──────────────────────┘
        │                      │
        ▼                      ▼
┌──────────────┐    ┌────────────────────┐
│  LiquidJS    │    │  Browser DOM       │
│  Engine      │    │                    │
│              │    │  Real Chromium     │
│  Filters     │    │  via Playwright    │
│  Tags        │    │                    │
│  Custom fs   │    │  Vitest locators   │
│  adapter     │    │  + userEvent       │
└──────┬───────┘    └────────────────────┘
       │
       │ fetch('/__assay__/button.liquid')
       ▼
┌──────────────┐
│  Vite Plugin │
│              │
│  Serves      │
│  .liquid     │
│  files from  │
│  configured  │
│  liquidPaths │
└──────────────┘
```

Vitest browser mode runs tests through Vite's dev server. All test code,
including LiquidJS, executes in real Chromium. LiquidJS is configured with a
custom `fs` adapter that uses `fetch` instead of Node's `fs` module. The Vite
plugin serves `.liquid` files from the configured paths, so when LiquidJS calls
`fetch('/__assay__/button.liquid')`, Vite's dev server intercepts the request
and returns the file from disk. Nested `{% render %}` tags resolve the same way.

### Key Implementation Details

- **Custom `fs` adapter**: LiquidJS has an abstract file system interface. We
  implement it with `fetch` against Vite's dev server. The `exists` method
  always returns `true` (the middleware handles multi-path lookup internally).
- **`activateScripts`**: `innerHTML` doesn't execute `<script>` tags. After
  rendering, we clone each `<script>` element so the browser treats it as new
  and executes it.
- **`define` for config**: The Vite plugin uses Vite's `define` to inject the
  `assetsPath` as a compile-time constant (`__ASSAY_ASSET_PATH__`) into the
  browser bundle. See `plugin.ts` and `filters.ts`.
- **No-op Shopify tags**: Tags like `{% schema %}` are registered as no-ops that
  consume their content without rendering. This lets real Shopify templates
  render without errors. |
