// `form` is a mock — Shopify generates form_type-specific actions, hidden
// inputs, and id/class defaults that we approximate. Critical pieces a
// theme will rely on: `return_to` is rendered as a hidden input (not a
// form attribute, so it's actually carried on submit), and `product` /
// `customer_address` forms derive their `id` and `product-id` hidden
// input from the parameter object.

import { beforeEach, describe, expect, it } from "vitest";
import { liquid, render } from "@";

describe("form tag", () => {
	let container: HTMLElement;

	describe("when the form_type is 'contact'", () => {
		beforeEach(async () => {
			container = await render(liquid`
{% form 'contact' %}
	<input data-testid="name" name="name">
{% endform %}
			`);
		});

		it("uses the contact action URL", () => {
			expect(getForm(container)?.getAttribute("action")).toBe(
				"/contact#contact_form",
			);
		});

		it("uses the post method", () => {
			expect(getForm(container)?.getAttribute("method")).toBe("post");
		});

		it("applies the contact-form class", () => {
			expect(getForm(container)?.getAttribute("class")).toBe("contact-form");
		});

		it("applies the contact_form id", () => {
			expect(getForm(container)?.getAttribute("id")).toBe("contact_form");
		});

		it("includes the hidden form_type input", () => {
			expect(
				getForm(container)
					?.querySelector('input[name="form_type"]')
					?.getAttribute("value"),
			).toBe("contact");
		});

		it("includes the hidden utf8 input", () => {
			expect(
				getForm(container)?.querySelector('input[name="utf8"]'),
			).not.toBeNull();
		});
	});

	describe("with a body", () => {
		beforeEach(async () => {
			container = await render(liquid`
{% form 'cart', cart %}
	<button data-testid="cart-button">Update</button>
{% endform %}
			`);
		});

		it("renders the body content inside the form", () => {
			expect(
				container.querySelector('[data-testid="cart-button"]')?.textContent,
			).toBe("Update");
		});
	});

	describe("with `return_to`", () => {
		beforeEach(async () => {
			container = await render(liquid`
{% form 'customer_login', return_to: '/account' %}
	<input data-testid="email" name="email">
{% endform %}
			`);
		});

		it("emits return_to as a hidden input, not a form attribute", () => {
			const form = getForm(container);
			expect(
				form?.querySelector('input[name="return_to"]')?.getAttribute("value"),
			).toBe("/account");
			expect(form?.hasAttribute("return_to")).toBe(false);
		});
	});

	describe("with id and class overrides", () => {
		beforeEach(async () => {
			container = await render(liquid`
{% form 'cart', id: 'my-cart', class: 'mine' %}
	<input data-testid="qty" name="qty">
{% endform %}
			`);
		});

		it("uses the supplied id", () => {
			expect(getForm(container)?.getAttribute("id")).toBe("my-cart");
		});

		it("uses the supplied class", () => {
			expect(getForm(container)?.getAttribute("class")).toBe("mine");
		});
	});

	describe("with hyphenated `data-*` keyword arguments", () => {
		beforeEach(async () => {
			container = await render(liquid`
{% form 'cart', data-example: '100' %}
	<input data-testid="data" name="data">
{% endform %}
			`);
		});

		it("forwards data-* keys as HTML attributes", () => {
			expect(getForm(container)?.getAttribute("data-example")).toBe("100");
		});
	});

	describe("when the form_type is 'product' with a parameter", () => {
		beforeEach(async () => {
			container = await render(
				liquid`
{% form 'product', product %}
	<button data-testid="add">Add to cart</button>
{% endform %}
			`,
				{ product: { id: 6786188247105 } },
			);
		});

		it("derives the form id from the product id", () => {
			expect(getForm(container)?.getAttribute("id")).toBe(
				"product_form_6786188247105",
			);
		});

		it("emits a `product-id` hidden input with the product id", () => {
			expect(
				getForm(container)
					?.querySelector('input[name="product-id"]')
					?.getAttribute("value"),
			).toBe("6786188247105");
		});
	});

	describe("when the form_type is 'customer_address' with an existing address", () => {
		beforeEach(async () => {
			container = await render(
				liquid`
{% form 'customer_address', address %}
	<input data-testid="street" name="address1">
{% endform %}
			`,
				{ address: { id: 4242 } },
			);
		});

		it("derives the form id from the address id", () => {
			expect(getForm(container)?.getAttribute("id")).toBe("address_form_4242");
		});
	});

	describe("when the form_type is 'guest_login'", () => {
		beforeEach(async () => {
			container = await render(liquid`
{% form 'guest_login' %}
	<input data-testid="email" name="email">
{% endform %}
			`);
		});

		it("emits a `guest=true` hidden input", () => {
			expect(
				getForm(container)
					?.querySelector('input[name="guest"]')
					?.getAttribute("value"),
			).toBe("true");
		});
	});

	describe("when the form_type is 'localization'", () => {
		beforeEach(async () => {
			container = await render(liquid`
{% form 'localization' %}
	<select data-testid="locale" name="locale_code"><option>en</option></select>
{% endform %}
			`);
		});

		it("emits a `_method=put` hidden input", () => {
			expect(
				getForm(container)
					?.querySelector('input[name="_method"]')
					?.getAttribute("value"),
			).toBe("put");
		});
	});
});

function getForm(container: HTMLElement): HTMLFormElement | null {
	return container.querySelector("form");
}
