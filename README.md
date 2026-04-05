# Assay

[![Tests](https://github.com/seanhealy/assay/actions/workflows/test.yml/badge.svg)](https://github.com/seanhealy/assay/actions/workflows/test.yml)

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

See the [📄 `example/`](./example) directory for an example theme with tests.

---

## Contents

- [Writing Tests](#writing-tests)
- [Install](#install)
- [Setup](#setup)
- [Filters & Tags](#filters--tags)
- [Learn More](#learn-more)
- [Future Plans](#future-plans)

---

## Writing Tests

```typescript
import { renderSnippet } from "@augeo/assay";
import { beforeEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

describe("product-card.liquid", () => {
	describe("with an available product", () => {
		beforeEach(() =>
			renderSnippet("product-card", {
				product: { title: "Classic Tee", price: 2999, available: true },
			}),
		);

		it("renders the product title", async () => {
			await expect.element(page.getByText("Classic Tee")).toBeVisible();
		});

		it("renders the formatted price", async () => {
			await expect.element(page.getByText("$29.99")).toBeVisible();
		});

		it("adds to cart when clicked", async () => {
			await userEvent.click(page.getByRole("button", { name: "Add to cart" }));

			await expect.element(page.getByText("Added!")).toBeVisible();
		});
	});
});
```

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

📄 [See example](./example/vitest.config.ts)

```typescript
import { assayPreset } from "@augeo/assay/preset";

export default assayPreset({
	liquidPaths: ["./theme/snippets", "./theme/sections"],
	assetsPath: "theme/assets",
});
```

| Option        | Default          | Description                                                 |
| ------------- | ---------------- | ----------------------------------------------------------- |
| `liquidPaths` | `['./snippets']` | Directories containing `.liquid` template files             |
| `assetsPath`  | `'assets'`       | Directory for theme assets (used by the `asset_url` filter) |

## Web Components

Web components are supported and fully upgrade as expected. See
[Advanced Usage](./docs/advanced-usage.md#web-components) for `waitForElements`
and more details.

## Filters & Tags

Assay mocks Shopify-specific Liquid filters and tags that aren't in LiquidJS
core. See the full compatibility tables:

- 📄 [Filters](./docs/filters.md) — 59 core, 2 mocked, 85 unsupported
- 📄 [Tags](./docs/tags.md) — 18 core, 1 mocked, 11 unsupported

Need a filter or tag that's not yet supported? See
[Advanced Usage](./docs/advanced-usage.md) for how to register your own.

## Learn More

- [Advanced Usage](./docs/advanced-usage.md): custom filters, tags, preset
  overrides, web components
- [Vitest Browser Mode](https://vitest.dev/guide/browser/): how tests run in a
  real browser
- [Testing Library Guiding Principles](https://testing-library.com/docs/guiding-principles):
  the philosophy behind `getByRole`, `getByText`, and user-centric testing
- [Vitest Locators](https://vitest.dev/api/browser/locators): how to find
  elements with `page.getByRole`, `page.getByText`, etc.
- [Vitest Assertions](https://vitest.dev/api/browser/assertions): `toBeVisible`,
  `toBeChecked`, `toHaveTextContent`, and more
- [Vitest](https://vitest.dev/guide/): the test runner Assay is built on

## Future Plans

- Auto-generated Shopify Liquid object types from
  [`Shopify/theme-liquid-docs`](https://github.com/Shopify/theme-liquid-docs)
  (`data/objects.json`) (MIT license attribution required)
- Default fixture data (product, cart, shop, etc.) with spread-and-override
  pattern
- Translation support (`| t` filter + locale JSON loading)
- Additional filter and tag mocks (e.g., `{% javascript %}`, `{% stylesheet %}`)
- Automatic custom element detection — scan rendered HTML for non-standard tags
  and wait for `customElements.whenDefined()` without explicit `waitForElements`
- Visual regression helpers
- Shadow DOM query support
