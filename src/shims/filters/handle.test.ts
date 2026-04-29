import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { liquid, render } from "@";

describe("handle()", () => {
	describe("with the Shopify docs example", () => {
		beforeEach(() =>
			render(
				liquid`<div data-testid="output">{{ product.title | handle }}</div>`,
				{ product: { title: "Health potion" } },
			),
		);

		it("slugifies via the `handleize` alias", async () => {
			await expect
				.element(page.getByTestId("output"))
				.toHaveTextContent("health-potion");
		});
	});
});
