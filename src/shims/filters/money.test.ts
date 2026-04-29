// Shopify reference: https://shopify.dev/docs/api/liquid/filters/money
// Real Shopify formats prices according to the store's HTML-without-currency
// setting. The Assay shim treats the input as cents and emits a fixed
// `$X.XX` form so tests don't depend on locale-specific formatting.

import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { liquid, render } from "@";

describe("money filter", () => {
	beforeEach(() =>
		render(
			liquid`
<div data-testid="ten-dollars">{{ price | money }}</div>
<div data-testid="zero">{{ 0 | money }}</div>
<div data-testid="non-number">{{ "abc" | money }}</div>
		`,
			{ price: 1000 },
		),
	);

	it("formats a numeric price as $X.XX (treating input as cents)", async () => {
		await expect
			.element(page.getByTestId("ten-dollars"))
			.toHaveTextContent("$10.00");
	});

	it("formats zero as $0.00", async () => {
		await expect.element(page.getByTestId("zero")).toHaveTextContent("$0.00");
	});

	it("passes non-numeric values through unchanged", async () => {
		await expect
			.element(page.getByTestId("non-number"))
			.toHaveTextContent("abc");
	});
});
