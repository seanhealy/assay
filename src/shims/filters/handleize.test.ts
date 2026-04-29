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

	describe("with a camelCase string", () => {
		beforeEach(() =>
			render(
				liquid`<div data-testid="camel">{{ "HelloWorld" | handleize }}</div>`,
			),
		);

		it("lowercases without splitting on case boundaries", async () => {
			await expect
				.element(page.getByTestId("camel"))
				.toHaveTextContent("helloworld");
		});
	});

	describe("with diacritics", () => {
		beforeEach(() =>
			render(liquid`<div data-testid="accent">{{ "Café" | handleize }}</div>`),
		);

		it("strips diacritics from letters", async () => {
			await expect
				.element(page.getByTestId("accent"))
				.toHaveTextContent("cafe");
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
