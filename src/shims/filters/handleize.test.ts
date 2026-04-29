// Shopify reference: https://shopify.dev/docs/api/liquid/filters/handleize
// `handleize` slugifies a string into a URL-safe handle: lowercase, with any
// run of non-alphanumeric characters collapsed to a single hyphen, and leading
// or trailing hyphens trimmed. Aliased as `handle` — both names register to
// the same implementation.

import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { liquid, render } from "@";

describe("handleize / handle filters", () => {
	beforeEach(() =>
		render(
			liquid`
<div data-testid="handleize">{{ product.title | handleize }}</div>
<div data-testid="handle">{{ product.title | handle }}</div>
<div data-testid="punctuation">{{ "Health & Wellness!" | handleize }}</div>
<div data-testid="trim">{{ "  spaced out  " | handleize }}</div>
<div data-testid="empty">[{{ nothing | handleize }}]</div>
		`,
			{ product: { title: "Health potion" } },
		),
	);

	it("slugifies via `handleize` (Shopify docs example)", async () => {
		await expect
			.element(page.getByTestId("handleize"))
			.toHaveTextContent("health-potion");
	});

	it("slugifies identically via the `handle` alias", async () => {
		await expect
			.element(page.getByTestId("handle"))
			.toHaveTextContent("health-potion");
	});

	it("collapses runs of punctuation and whitespace into a single hyphen", async () => {
		await expect
			.element(page.getByTestId("punctuation"))
			.toHaveTextContent("health-wellness");
	});

	it("trims leading and trailing hyphens", async () => {
		await expect
			.element(page.getByTestId("trim"))
			.toHaveTextContent("spaced-out");
	});

	it("returns an empty string for nil input", async () => {
		await expect.element(page.getByTestId("empty")).toHaveTextContent("[]");
	});
});
