// Shopify reference: https://shopify.dev/docs/api/liquid/tags/paginate
// `{% paginate collection.products by N %}` paginates an iterable inside
// its body and exposes a `paginate` drop with metadata. The Assay shim is
// a passthrough that always renders page 1 — it never reads URL params or
// slices the collection — but populates the drop's fields so themes that
// branch on them behave consistently in tests.

import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { liquid, render } from "@";

describe("paginate tag", () => {
	describe("with a single page of products", () => {
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

		describe("the body content", () => {
			it("renders the first product title", async () => {
				await expect
					.element(page.getByTestId("products"))
					.toHaveTextContent("Blue Mountain Flower");
			});

			it("renders the last product title", async () => {
				await expect
					.element(page.getByTestId("products"))
					.toHaveTextContent("Crocodile tears");
			});
		});

		describe("the paginate drop", () => {
			it("exposes `current_page` as 1", async () => {
				await expect
					.element(page.getByTestId("current-page"))
					.toHaveTextContent("1");
			});

			it("exposes `pages` based on `items / page_size`", async () => {
				await expect.element(page.getByTestId("pages")).toHaveTextContent("1");
			});

			it("exposes `items` from the collection length", async () => {
				await expect.element(page.getByTestId("items")).toHaveTextContent("3");
			});

			it("treats `next.is_link` as false on the only page", async () => {
				await expect
					.element(page.getByTestId("next-link"))
					.toHaveTextContent("false");
			});
		});
	});

	describe("when the collection spans multiple pages", () => {
		beforeEach(() =>
			render(
				liquid`
{% paginate collection.products by 2 %}
	<div data-testid="pages">{{ paginate.pages }}</div>
	<div data-testid="next-link">{{ paginate.next.is_link }}</div>
	<div data-testid="next-url">{{ paginate.next.url }}</div>
	<ol data-testid="parts">
		{% for part in paginate.parts %}
			<li data-link="{{ part.is_link }}" data-url="{{ part.url }}">{{ part.title }}</li>
		{% endfor %}
	</ol>
{% endpaginate %}
			`,
				{
					collection: {
						products: [
							{ title: "Blue Mountain Flower" },
							{ title: "Charcoal" },
							{ title: "Crocodile tears" },
							{ title: "Dandelion milk" },
							{ title: "Draught of Immortality" },
						],
					},
				},
			),
		);

		it("exposes `pages` as ceil(items / page_size)", async () => {
			await expect.element(page.getByTestId("pages")).toHaveTextContent("3");
		});

		it("treats `next.is_link` as true past the first page", async () => {
			await expect
				.element(page.getByTestId("next-link"))
				.toHaveTextContent("true");
		});

		it("links `next.url` to the next page", async () => {
			await expect
				.element(page.getByTestId("next-url"))
				.toHaveTextContent("?page=2");
		});

		it("emits one `parts` entry per page", async () => {
			await expect
				.element(page.getByTestId("parts"))
				.toHaveTextContent("1 2 3");
		});
	});

	describe("when given a `window_size` option", () => {
		beforeEach(() =>
			render(
				liquid`
{% paginate collection.products by 5, window_size: 1 %}
	<div data-testid="ok">{{ paginate.pages }}</div>
{% endpaginate %}
			`,
				{ collection: { products: [{ title: "Blue Mountain Flower" }] } },
			),
		);

		it("renders the body without erroring", async () => {
			await expect.element(page.getByTestId("ok")).toHaveTextContent("1");
		});
	});
});
