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
	/** Hidden inputs emitted between form_type/utf8 and the body. */
	hiddenBefore?: Record<string, string>;
	/** Hidden inputs emitted between the body and `</form>`. */
	hiddenAfter?: Record<string, string>;
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
		hiddenAfter: { guest: "true" },
	},
	localization: {
		action: "/localization",
		id: "localization_form",
		class: "shopify-localization-form",
		enctype: "multipart/form-data",
		hiddenBefore: { _method: "put" },
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
		"Wraps the body in `<form>` with the action, id/class defaults, and hidden inputs (`form_type`, `utf8`, plus per-type extras like `_method`, `guest`, `product-id`) associated with the given form type. The optional second positional argument supplies the parameter object — used to derive `product_form_<id>` / `address_form_<id>` IDs and the product `product-id` hidden input. `return_to` emits as a hidden input, not a form attribute, so submissions actually carry the redirect path.",
	implementation: {
		parse(token, remainingTokens) {
			const tokenizer = token.tokenizer as Tokenizer;
			this.formTypeToken = tokenizer.readValue();
			const { positional, keywords } = readArgs(tokenizer);
			this.parameterToken = positional;
			this.keywordTokens = keywords;
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
			const parameter = this.parameterToken
				? yield evalToken(this.parameterToken as ValueToken, ctx)
				: undefined;
			const evaluated: Record<string, unknown> = {};
			for (const [name, valueToken] of this.keywordTokens as Array<
				[string, ValueToken]
			>) {
				evaluated[name] = yield evalToken(valueToken, ctx);
			}
			// `return_to` is rendered as a hidden input below, not a form
			// attribute — otherwise the browser wouldn't include it on submit.
			const { return_to, ...htmlAttrs } = evaluated;

			const config = FORMS[formType] ?? { action: "" };
			const id = deriveId(formType, config, parameter, htmlAttrs);
			const productId = readProductId(formType, parameter);

			emitter.write(
				`<form${attributes({
					method: "post",
					action: config.action,
					id,
					"accept-charset": "UTF-8",
					class: config.class,
					enctype: config.enctype,
					...(config.dataLogin === "sign-in" && {
						"data-login-with-shop-sign-in": "true",
					}),
					...(config.dataLogin === "sign-up" && {
						"data-login-with-shop-sign-up": "true",
					}),
					...htmlAttrs,
				})}>`,
			);
			emitter.write(hiddenInput("form_type", formType));
			emitter.write(hiddenInput("utf8", "✓"));
			if (config.hiddenBefore) {
				for (const [name, value] of Object.entries(config.hiddenBefore)) {
					emitter.write(hiddenInput(name, value));
				}
			}
			if (typeof return_to === "string") {
				emitter.write(hiddenInput("return_to", return_to));
			}
			yield this.liquid.renderer.renderTemplates(
				this.templates as Template[],
				ctx,
				emitter,
			);
			if (productId !== undefined) {
				emitter.write(hiddenInput("product-id", productId));
			}
			if (config.hiddenAfter) {
				for (const [name, value] of Object.entries(config.hiddenAfter)) {
					emitter.write(hiddenInput(name, value));
				}
			}
			emitter.write(`</form>`);
		},
	},
} satisfies ShimTag;

function deriveId(
	formType: string,
	config: FormConfig,
	parameter: unknown,
	attrs: Record<string, unknown>,
): string | undefined {
	if (typeof attrs.id === "string") return attrs.id;
	if (formType === "product" && parameter && typeof parameter === "object") {
		const id = (parameter as { id?: unknown }).id;
		if (id !== undefined) return `product_form_${id}`;
	}
	if (
		formType === "customer_address" &&
		parameter &&
		typeof parameter === "object"
	) {
		const id = (parameter as { id?: unknown }).id;
		if (id !== undefined) return `address_form_${id}`;
	}
	return config.id;
}

function readProductId(
	formType: string,
	parameter: unknown,
): string | undefined {
	if (formType !== "product") return undefined;
	if (!parameter || typeof parameter !== "object") return undefined;
	const id = (parameter as { id?: unknown }).id;
	return id === undefined ? undefined : String(id);
}

/**
 * Reads the args after `form_type`. Captures the first positional value
 * (the parameter object — Shopify uses it for `product.id` /
 * `address_form_<id>`) and any number of `name: value` keyword arguments.
 * Hand-rolled instead of LiquidJS's `Hash` because Shopify accepts
 * hyphenated `data-*` keys, which the framework's identifier reader rejects.
 */
function readArgs(tokenizer: Tokenizer): {
	positional: ValueToken | undefined;
	keywords: Array<[string, ValueToken]>;
} {
	const keywords: Array<[string, ValueToken]> = [];
	let positional: ValueToken | undefined;
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
			keywords.push([name, value]);
			continue;
		}
		tokenizer.p = start;
		const consumed = tokenizer.readValue();
		if (!consumed) break;
		if (positional === undefined) positional = consumed;
	}
	return { positional, keywords };
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
