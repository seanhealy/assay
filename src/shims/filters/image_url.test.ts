// Shopify reference: https://shopify.dev/docs/api/liquid/filters/image_url
// Real Shopify returns a CDN URL like
//   //store.myshopify.com/cdn/shop/files/photo.jpg?v=…&width=200
// The Assay shim returns a 1x1 transparent PNG data URL so <img> tags don't
// 404 in tests, and appends supplied parameters as a URL fragment so tests
// can assert which arguments were passed without resolving real images.

import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { liquid, render } from "@";

const PIXEL_PREFIX = "data:image/png;base64,";

describe("image_url filter", () => {
	beforeEach(() =>
		render(
			liquid`
<img data-testid="plain" src="{{ product | image_url }}" />
<img data-testid="width" src="{{ product | image_url: width: 200 }}" />
<img data-testid="dimensions" src="{{ product | image_url: width: 200, height: 100 }}" />
		`,
			{ product: { title: "Potion" } },
		),
	);

	it("returns a placeholder data URL when no args are supplied", async () => {
		const src = await page.getByTestId("plain").element().getAttribute("src");
		expect(src).toMatch(new RegExp(`^${PIXEL_PREFIX}[A-Za-z0-9+/=]+$`));
	});

	it("appends keyword arguments as a URL fragment", async () => {
		const src = await page.getByTestId("width").element().getAttribute("src");
		expect(src).toContain(PIXEL_PREFIX);
		expect(src).toContain("#width=200");
	});

	it("preserves multiple keyword arguments", async () => {
		const src = await page
			.getByTestId("dimensions")
			.element()
			.getAttribute("src");
		expect(src).toContain("width=200");
		expect(src).toContain("height=100");
	});
});
