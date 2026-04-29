// Shopify reference: https://shopify.dev/docs/api/liquid/tags/paginate
// `{% paginate collection.products by N %}` paginates an iterable inside its
// body and exposes a `paginate` drop with metadata. The Assay shim is a
// passthrough that always renders page 1 — it never reads URL params or
// slices the collection — but populates `paginate.current_page`,
// `paginate.pages`, `paginate.items`, and `paginate.next` so themes that
// branch on those fields behave consistently in tests.

import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { liquid, render } from "@";

describe("paginate tag", () => {
	beforeEach(() =>
		render(
			liquid`
{% paginate collection.products by 5 %}
	<ul data-testid="products">
		{% for product in collection.products %}
			<li>{{ product.title }}</li>
		{% endfor %}
	</ul>
	<div data-testid="current-page">{{ paginate.current_page }}</div>
	<div data-testid="pages">{{ paginate.pages }}</div>
	<div data-testid="items">{{ paginate.items }}</div>
	<div data-testid="next-link">{{ paginate.next.is_link }}</div>
{% endpaginate %}
		`,
			{
				collection: {
					products: [
						{ title: "Blue Mountain Flower" },
						{ title: "Charcoal" },
						{ title: "Crocodile tears" },
					],
				},
			},
		),
	);

	it("renders the body content", async () => {
		await expect
			.element(page.getByTestId("products"))
			.toHaveTextContent("Blue Mountain Flower");
		await expect
			.element(page.getByTestId("products"))
			.toHaveTextContent("Charcoal");
	});

	it("exposes `paginate.current_page` (always 1) and `pages`", async () => {
		await expect
			.element(page.getByTestId("current-page"))
			.toHaveTextContent("1");
		await expect.element(page.getByTestId("pages")).toHaveTextContent("1");
	});

	it("exposes `paginate.items` from the collection length", async () => {
		await expect.element(page.getByTestId("items")).toHaveTextContent("3");
	});

	it("treats `paginate.next.is_link` as false when there's only one page", async () => {
		await expect
			.element(page.getByTestId("next-link"))
			.toHaveTextContent("false");
	});
});
