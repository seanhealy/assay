// Shopify reference: https://shopify.dev/docs/api/liquid/filters/asset_img_url
// Real Shopify returns a CDN URL with a size suffix in the filename
// (e.g. `red-and-black-bramble-berries_large.jpg`). The Assay shim ignores
// the size argument and returns the raw asset path so fixture files resolve.

import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { liquid, render } from "@";

describe("asset_img_url filter", () => {
	beforeEach(() =>
		render(liquid`
<div data-testid="default">{{ 'icon.svg' | asset_img_url }}</div>
<div data-testid="sized">{{ 'icon.svg' | asset_img_url: 'large' }}</div>
		`),
	);

	it("returns the asset path for a given filename", async () => {
		await expect
			.element(page.getByTestId("default"))
			.toHaveTextContent("/tests/fixtures/assets/icon.svg");
	});

	it("ignores the optional size argument", async () => {
		await expect
			.element(page.getByTestId("sized"))
			.toHaveTextContent("/tests/fixtures/assets/icon.svg");
	});
});
