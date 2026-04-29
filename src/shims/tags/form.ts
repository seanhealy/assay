import { escape as escapeHtml } from "es-toolkit/string";
import type { Template, Tokenizer, ValueToken } from "liquidjs";
import { evalToken } from "liquidjs";
import { attributes } from "../shared/html";
import type { ShimTag } from "../types";
import { parseBlockBody } from "./shared/passthrough-block";

interface FormConfig {
	action: string;
	id?: string;
	class?: string;
	enctype?: string;
	hidden?: Record<string, string>;
	dataLogin?: "sign-in" | "sign-up";
}

const FORMS: Record<string, FormConfig> = {
	activate_customer_password: { action: "/account/activate" },
	cart: {
		action: "/cart",
		id: "cart_form",
		class: "shopify-cart-form",
		enctype: "multipart/form-data",
	},
	contact: {
		action: "/contact#contact_form",
		id: "contact_form",
		class: "contact-form",
	},
	create_customer: {
		action: "/account",
		id: "create_customer",
		dataLogin: "sign-up",
	},
	currency: {
		action: "/cart/update",
		id: "currency_form",
		class: "shopify-currency-form",
		enctype: "multipart/form-data",
	},
	customer: {
		action: "/contact#contact_form",
		id: "contact_form",
		class: "contact-form",
	},
	customer_address: { action: "/account/addresses", id: "address_form_new" },
	customer_login: {
		action: "/account/login",
		id: "customer_login",
		dataLogin: "sign-in",
	},
	guest_login: {
		action: "/account/login",
		id: "customer_login_guest",
		hidden: { guest: "true" },
	},
	localization: {
		action: "/localization",
		id: "localization_form",
		class: "shopify-localization-form",
		enctype: "multipart/form-data",
		hidden: { _method: "put" },
	},
	new_comment: { action: "", id: "comment_form", class: "comment-form" },
	product: {
		action: "/cart/add",
		class: "shopify-product-form",
		enctype: "multipart/form-data",
	},
	recover_customer_password: { action: "/account/recover" },
	reset_customer_password: { action: "/account/reset" },
	storefront_password: {
		action: "/password",
		id: "login_form",
		class: "storefront-password-form",
	},
};

export default {
	type: "tag",
	name: "form",
	status: "mock",
	description:
		"Wraps the body in `<form>` with the action, hidden inputs, and id/class defaults associated with the given form type.",
	implementation: {
		parse(token, remainingTokens) {
			const tokenizer = token.tokenizer as Tokenizer;
			this.formTypeToken = tokenizer.readValue();
			this.attrTokens = readArgs(tokenizer);
			this.templates = parseBlockBody(
				"form",
				this.liquid.parser,
				remainingTokens,
			);
		},
		*render(ctx, emitter): Generator<unknown, void, unknown> {
			const formType = String(
				yield evalToken(this.formTypeToken as ValueToken, ctx),
			);
			const attrs: Record<string, unknown> = {};
			for (const [name, valueToken] of this.attrTokens as Array<
				[string, ValueToken]
			>) {
				attrs[name] = yield evalToken(valueToken, ctx);
			}

			const config = FORMS[formType] ?? { action: "" };
			emitter.write(
				`<form${attributes({
					method: "post",
					action: config.action,
					id: config.id,
					"accept-charset": "UTF-8",
					class: config.class,
					enctype: config.enctype,
					...(config.dataLogin === "sign-in" && {
						"data-login-with-shop-sign-in": "true",
					}),
					...(config.dataLogin === "sign-up" && {
						"data-login-with-shop-sign-up": "true",
					}),
					...attrs,
				})}>`,
			);
			emitter.write(hiddenInput("form_type", formType));
			emitter.write(hiddenInput("utf8", "✓"));
			if (config.hidden) {
				for (const [name, value] of Object.entries(config.hidden)) {
					emitter.write(hiddenInput(name, value));
				}
			}
			yield this.liquid.renderer.renderTemplates(
				this.templates as Template[],
				ctx,
				emitter,
			);
			emitter.write(`</form>`);
		},
	},
} satisfies ShimTag;

/**
 * Reads the remaining args after `form_type`. Treats `name: value` pairs as
 * HTML attributes and silently consumes any extra positional arguments (the
 * parameter object — Shopify uses it to pull `id` for product/customer_address
 * forms; the shim doesn't model that detail). Hand-rolled rather than using
 * LiquidJS's `Hash` because Shopify allows hyphenated `data-*` attributes,
 * which the framework's identifier reader rejects. Stops at end-of-input.
 */
function readArgs(tokenizer: Tokenizer): Array<[string, ValueToken]> {
	const result: Array<[string, ValueToken]> = [];
	while (!tokenizer.end()) {
		tokenizer.skipBlank();
		if (tokenizer.peek() === ",") tokenizer.advance();
		tokenizer.skipBlank();
		if (tokenizer.end()) break;
		const start = tokenizer.p;
		const name = readAttributeName(tokenizer);
		tokenizer.skipBlank();
		if (name && tokenizer.peek() === ":") {
			tokenizer.advance();
			tokenizer.skipBlank();
			const value = tokenizer.readValue();
			if (!value) break;
			result.push([name, value]);
			continue;
		}
		tokenizer.p = start;
		const consumed = tokenizer.readValue();
		if (!consumed) break;
	}
	return result;
}

function readAttributeName(tokenizer: Tokenizer): string {
	let result = "";
	while (!tokenizer.end()) {
		const char = tokenizer.peek();
		if (/[A-Za-z0-9_-]/.test(char)) {
			result += char;
			tokenizer.advance();
		} else break;
	}
	return result;
}

function hiddenInput(name: string, value: string): string {
	return `<input type="hidden" name="${name}" value="${escapeHtml(value)}">`;
}
