// Shopify reference: https://shopify.dev/docs/api/liquid/tags/form
// `{% form 'form_type', ... %}` wraps the body in a `<form>` element with
// the action URL, id/class defaults, and hidden inputs that Shopify
// generates for the given form type. The Assay shim implements the wiring
// per form type (action, default id/class/enctype, `form_type` and `utf8`
// hidden inputs) and forwards keyword arguments as HTML attributes. The
// optional second positional argument (the form's parameter object — used
// in real Shopify to fill `product-id` and `address_form_<id>`) is
// intentionally ignored: the shim is partial by design, focused on
// producing valid form HTML for tests.

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

	describe("with keyword arguments", () => {
		beforeEach(async () => {
			container = await render(liquid`
{% form 'customer_login', return_to: '/account' %}
	<input data-testid="email" name="email">
{% endform %}
			`);
		});

		it("forwards arbitrary keywords as HTML attributes", () => {
			expect(getForm(container)?.getAttribute("return_to")).toBe("/account");
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
});

function getForm(container: HTMLElement): HTMLFormElement | null {
	return container.querySelector("form");
}
