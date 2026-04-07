# Assay

[![Tests](https://github.com/seanhealy/assay/actions/workflows/test.yml/badge.svg)](https://github.com/seanhealy/assay/actions/workflows/test.yml)

Test Shopify Liquid templates with Vitest. Render snippets, sections, and
blocks, then query and interact with familiar Testing Library patterns.

## Why

- **Shopify-ready.** Filters like `| money` and `| asset_url` work out of the
  box. `{% schema %}` tags are handled. More filters shipping regularly.
- **Simple API.** `render("button", { text: "Click me" })` — one function,
  template name, data. Everything else is handled for you.
- **Web components.** `<script>` tags execute, custom elements upgrade. Test
  interactive components the same way they work in production.
- **Cross-browser.** Tests run in real Chromium, Firefox, or WebKit via Vitest
  Browser Mode — catch browser-specific issues before your users do.

---

## Contents

- [Example](#example)
- [Install](#install)
- [Setup](#setup)
- [Web Components](#web-components)
- [Filters & Tags](#filters--tags)
- [Mocking](#mocking)
- [Learn More](#learn-more)
- [Future Plans](#future-plans)

---

## Example

```typescript
import { render } from "@augeo/assay";
import { beforeEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

describe("product-card.liquid", () => {
	describe("with an available product", () => {
		beforeEach(() =>
			render("product-card", {
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

See the [📄 `example/`](./example) directory for an example theme with tests.

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

Audit your theme to see which filters and tags you use are currently supported:

```bash
npx @augeo/assay audit ./path/to/theme
```

Need a filter or tag that's not yet supported? See
[Advanced Usage](./docs/advanced-usage.md) for how to register your own.

## Mocking

Mock nested `{% render %}` calls to test a section in isolation:

```typescript
import { mock, render } from "@augeo/assay";

mock("product-card", "<div data-testid='mock-card'>{{ product.title }}</div>");
```

See [Advanced Usage](./docs/advanced-usage.md#mocking) for more on mocking.

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
- Render spies — wrap the `render` tag to record which templates were rendered
  and with what data, enabling assertions like
  `expect(spy).toHaveBeenCalledWith({ product })`
- Automatic custom element detection — scan rendered HTML for non-standard tags
  and wait for `customElements.whenDefined()` without explicit `waitForElements`
- Visual regression helpers
- Shadow DOM query support
