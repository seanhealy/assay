// Shopify reference: https://shopify.dev/docs/api/liquid/tags/form
// `{% form 'form_type', ... %}` wraps the body in a `<form>` element with the
// action URL, id/class defaults, and hidden inputs that Shopify generates for
// the given form type. The Assay shim implements the wiring per form type
// (action, default id/class/enctype, `form_type` and `utf8` hidden inputs)
// and forwards keyword arguments as HTML attributes. The optional second
// positional argument (the form's parameter object — used in real Shopify to
// fill `product-id` and `address_form_<id>`) is intentionally ignored: the
// shim is partial by design, focused on producing valid form HTML for tests.

import { beforeEach, describe, expect, it } from "vitest";
import { liquid, render } from "@";

describe("form tag", () => {
	let container: HTMLElement;
	beforeEach(async () => {
		container = await render(
			liquid`
{% form 'contact' %}<input data-testid="contact-name" name="name">{% endform %}
{% form 'cart', cart %}<button data-testid="cart-button">Update</button>{% endform %}
{% form 'customer_login', return_to: '/account' %}<input data-testid="login-email" name="email">{% endform %}
{% form 'cart', id: 'my-cart', class: 'mine' %}<input data-testid="cart-quantity" name="qty">{% endform %}
		`,
			{ cart: { item_count: 0 } },
		);
	});

	it("emits a `<form>` with the action and defaults for the type", () => {
		const form = container
			.querySelector('[data-testid="contact-name"]')
			?.closest("form");
		expect(form?.getAttribute("action")).toBe("/contact#contact_form");
		expect(form?.getAttribute("method")).toBe("post");
		expect(form?.getAttribute("class")).toBe("contact-form");
		expect(form?.getAttribute("id")).toBe("contact_form");
	});

	it("includes the standard hidden `form_type` and `utf8` inputs", () => {
		const form = container
			.querySelector('[data-testid="contact-name"]')
			?.closest("form");
		expect(
			form?.querySelector('input[name="form_type"]')?.getAttribute("value"),
		).toBe("contact");
		expect(form?.querySelector('input[name="utf8"]')).not.toBeNull();
	});

	it("renders the body content inside the form", () => {
		expect(
			container.querySelector('[data-testid="cart-button"]')?.textContent,
		).toBe("Update");
	});

	it("forwards keyword arguments as HTML attributes", () => {
		const form = container
			.querySelector('[data-testid="login-email"]')
			?.closest("form");
		expect(form?.getAttribute("return_to")).toBe("/account");
	});

	it("lets `id` and `class` keyword args override the type defaults", () => {
		const form = container
			.querySelector('[data-testid="cart-quantity"]')
			?.closest("form");
		expect(form?.getAttribute("id")).toBe("my-cart");
		expect(form?.getAttribute("class")).toBe("mine");
	});
});
