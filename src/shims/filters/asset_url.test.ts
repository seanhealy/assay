// Shopify reference: https://shopify.dev/docs/api/liquid/filters/asset_url
// Real Shopify returns a CDN URL like
//   //store.myshopify.com/cdn/shop/t/4/assets/cart.js?v=…
// The Assay shim returns the path under the configured assetsPath instead, so
// fixture files in tests/fixtures/assets/ resolve correctly during tests.

import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { liquid, render } from "@";

describe("asset_url filter", () => {
	beforeEach(() =>
		render(
			liquid`<div data-testid="asset-url">{{ 'cart.js' | asset_url }}</div>`,
		),
	);

	it("returns the asset path for a given filename", async () => {
		await expect
			.element(page.getByTestId("asset-url"))
			.toHaveTextContent("/tests/fixtures/assets/cart.js");
	});
});
