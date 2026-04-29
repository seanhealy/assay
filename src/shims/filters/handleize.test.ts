// Shopify reference: https://shopify.dev/docs/api/liquid/filters/handleize
// `handleize` slugifies a string into a URL-safe handle: lowercase, with
// runs of non-alphanumeric characters collapsed to a single hyphen, and
// leading/trailing hyphens trimmed.

import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { liquid, render } from "@";

describe("handleize()", () => {
	describe("with the Shopify docs example", () => {
		beforeEach(() =>
			render(
				liquid`<div data-testid="output">{{ product.title | handleize }}</div>`,
				{ product: { title: "Health potion" } },
			),
		);

		it("slugifies the title to lowercase and hyphens", async () => {
			await expect
				.element(page.getByTestId("output"))
				.toHaveTextContent("health-potion");
		});
	});

	describe("with punctuation and surrounding whitespace", () => {
		beforeEach(() =>
			render(liquid`
<div data-testid="punctuation">{{ "Health & Wellness!" | handleize }}</div>
<div data-testid="whitespace">{{ "  spaced out  " | handleize }}</div>
			`),
		);

		it("collapses non-alphanumeric runs to a single hyphen", async () => {
			await expect
				.element(page.getByTestId("punctuation"))
				.toHaveTextContent("health-wellness");
		});

		it("trims leading and trailing whitespace", async () => {
			await expect
				.element(page.getByTestId("whitespace"))
				.toHaveTextContent("spaced-out");
		});
	});

	describe("with nil input", () => {
		beforeEach(() =>
			render(
				liquid`<div data-testid="empty">[{{ nothing | handleize }}]</div>`,
			),
		);

		it("returns an empty string", async () => {
			await expect.element(page.getByTestId("empty")).toHaveTextContent("[]");
		});
	});
});
