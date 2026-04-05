# Advanced Usage

## Web Components

Templates with `<script>` tags work. Scripts are executed after rendering. Use
`waitForElements` to wait for custom elements to upgrade before asserting:

📄 See example:

- [snippet](../example/theme/snippets/toggle-switch.liquid)
- [test](../example/tests/snippets/toggle-switch.test.ts)

```typescript
await renderSnippet(
	"toggle-switch",
	{ label: "Enable notifications" },
	{ waitForElements: ["toggle-switch"] },
);
```

### `renderSnippet` Options

| Parameter                 | Type                      | Description                                      |
| ------------------------- | ------------------------- | ------------------------------------------------ |
| `file`                    | `string`                  | Template filename (without `.liquid` extension)  |
| `data`                    | `Record<string, unknown>` | Template variables                               |
| `options.waitForElements` | `string[]`                | Custom element tags to wait for before returning |

Previous renders are cleaned up automatically.

## Custom Filters

Register additional Shopify filters that Assay doesn't yet mock. Do this in a
setup file that runs before your tests:

📄 [See example](../example/tests/setup.ts)

```typescript
// tests/setup.ts
import { registerFilter } from "@augeo/assay";

registerFilter("upcase_first", (value) => {
	const str = String(value ?? "");
	return str.charAt(0).toUpperCase() + str.slice(1);
});
```

## Custom Tags

Register custom Liquid tags the same way:

```typescript
import { registerTag } from "@augeo/assay";

registerTag("my_tag", {
	parse(token, remainingTokens) {
		// consume tokens
	},
	render(ctx, emitter) {
		// emit output
	},
});
```

See the
[LiquidJS tag documentation](https://liquidjs.com/tutorials/register-filters-tags.html)
for implementation details.

## Preset Overrides

`liquidPreset` accepts an optional second argument for
[Vitest config](https://vitest.dev/config/) and
[browser mode](https://vitest.dev/guide/browser/#configuration) overrides:

```typescript
import { liquidPreset } from "@augeo/assay/preset";

export default liquidPreset(
	{ liquidPaths: ["./theme/snippets"] },
	{
		test: {
			setupFiles: ["./tests/setup.ts"],
			browser: { headless: false },
		},
	},
);
```

Overrides are merged with Assay's defaults. Use
[`setupFiles`](https://vitest.dev/config/#setupfiles) to load custom filters and
tags before tests run. The `test.browser` object is spread on top of the
defaults (chromium, headless), so you can override individual settings without
losing the rest.

### Options

| Option        | Default          | Description                                                 |
| ------------- | ---------------- | ----------------------------------------------------------- |
| `liquidPaths` | `['./snippets']` | Directories containing `.liquid` template files             |
| `assetsPath`  | `'assets'`       | Directory for theme assets (used by the `asset_url` filter) |
