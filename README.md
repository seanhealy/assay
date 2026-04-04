# Assay

A Fast TypeScript-first testing stack for unit testing Shopify Liquid Themes.
Renders snippets, sections, and blocks with familiar Vitest + Testing Library
patterns. Including web component interaction, `userEvent`, and accessibility.

## Why

- **Real browser, real confidence.** Tests run in Chromium (or your browser of
  choice) via [Vitest Browser Mode](https://vitest.dev/guide/browser/).
- **Shopify-native mocks.** Filters like `| money` and `| asset_url` work out of
  the box. Working on filter parity. Register additional filters as needed.
- **Simple API.** Call `renderSnippet` with a filename and data. The Liquid
  engine, file resolution, and everything else is handled for you.

## Example

See the [`example/`](./example) directory for an example theme with tests.

---

## Contents

- [Writing Tests](#writing-tests)
- [Install](#install)
- [Setup](#setup)
- [Filters](#filters)
- [Tags](#tags)
- [Web Components](#web-components)
- [Learn More](#learn-more)
- [Future Plans](#future-plans)

---

## Writing Tests

```typescript
import { renderSnippet } from "@augeo/assay";
import { beforeEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

describe("hero.liquid", () => {
	describe("with a heading", () => {
		beforeEach(() =>
			renderSnippet("hero", {
				section: { settings: { heading: "Welcome" } },
			}),
		);

		it("renders the heading", async () => {
			await expect
				.element(page.getByRole("heading", { name: "Welcome" }))
				.toBeVisible();
		});
	});
});

describe("toggle-switch.liquid", () => {
	describe("when unchecked", () => {
		beforeEach(() =>
			renderSnippet("toggle-switch", {
				name: "notifications",
				label: "Enable notifications",
			}),
		);

		it("checks the checkbox when clicked", async () => {
			await userEvent.click(page.getByText("Enable notifications"));

			await expect
				.element(page.getByRole("checkbox", { name: "Enable notifications" }))
				.toBeChecked();
		});
	});
});
```

### `renderSnippet(file, data?, options?)`

Renders a `.liquid` template into the live browser DOM and returns the container
element.

| Parameter                 | Type                      | Description                                      |
| ------------------------- | ------------------------- | ------------------------------------------------ |
| `file`                    | `string`                  | Template filename (without `.liquid` extension)  |
| `data`                    | `Record<string, unknown>` | Template variables                               |
| `options.waitForElements` | `string[]`                | Custom element tags to wait for before returning |

Previous renders are cleaned up automatically. `<script>` tags in the rendered
HTML are executed.

## Install

```bash
npm install -D @augeo/assay vitest @vitest/browser-playwright
```

Then install Playwright's Chromium browser:

```bash
npx playwright install chromium
```

## Setup

### `vitest.config.ts`

```typescript
import { liquidPreset } from "@augeo/assay/preset";

export default liquidPreset({
	liquidPaths: ["./theme/snippets", "./theme/sections"],
	assetsPath: "theme/assets",
});
```

`liquidPreset` accepts an optional second argument for
[Vitest Config](https://vitest.dev/config/) and
[Browser Mode](https://vitest.dev/guide/browser/#configuration) overrides:

```typescript
export default liquidPreset(
	{ liquidPaths: ["./theme/snippets"] },
	{ test: { browser: { headless: false } } },
);
```

### Options

| Option        | Default          | Description                                                 |
| ------------- | ---------------- | ----------------------------------------------------------- |
| `liquidPaths` | `['./snippets']` | Directories containing `.liquid` template files             |
| `assetsPath`  | `'assets'`       | Directory for theme assets (used by the `asset_url` filter) |

### Filters

Built-in Shopify filter mocks:

| Filter      | Behaviour                                  |
| ----------- | ------------------------------------------ |
| `money`     | Cents to dollars (e.g., `2999` → `$29.99`) |
| `asset_url` | Prepends the configured assets path        |

Register additional filters in a setup file:

```typescript
// tests/setup.ts
import { registerFilter } from "@augeo/assay";

registerFilter("upcase_first", (value) => {
	const str = String(value ?? "");
	return str.charAt(0).toUpperCase() + str.slice(1);
});
```

Then reference it via Vitest's standard
[`setupFiles`](https://vitest.dev/config/#setupfiles).

### Tags

Built in Shopify-specific tags:

| Tag                              | Behaviour                                      |
| -------------------------------- | ---------------------------------------------- |
| `{% schema %}...{% endschema %}` | Silently ignored (section/block settings JSON) |

### Web Components

Templates with `<script>` tags work. Scripts are executed after rendering. Use
`waitForElements` to wait for custom elements to upgrade:

```typescript
await renderSnippet(
	"toggle-switch",
	{ label: "Enable notifications" },
	{ waitForElements: ["toggle-switch"] },
);
```

## Learn More

New to testing? These resources are a good starting point:

- [Vitest](https://vitest.dev/guide/): the test runner Assay is built on
- [Vitest Browser Mode](https://vitest.dev/guide/browser/): how tests run in a
  real browser
- [Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles):
  the philosophy behind `getByRole`, `getByText`, and user-centric testing
- [Testing Library Queries](https://testing-library.com/docs/queries/about): how
  to find elements in the DOM

## Future Plans

- Auto-generated Shopify Liquid object types from
  [`Shopify/theme-liquid-docs`](https://github.com/Shopify/theme-liquid-docs)
  (`data/objects.json`) (MIT license attribution required)
- Default fixture data (product, cart, shop, etc.) with spread-and-override
  pattern
- Translation support (`| t` filter + locale JSON loading)
- Additional filter and tag mocks (e.g., `{% javascript %}`, `{% stylesheet %}`)
- Automatic custom element detection. Scan rendered HTML non-standard tags and
  wait for `customElements.whenDefined()` without explicit `waitForElements`
- Visual regression helpers
- Shadow DOM query support
