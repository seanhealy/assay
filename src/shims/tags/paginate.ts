import type { Template, Tokenizer, ValueToken } from "liquidjs";
import { evalToken } from "liquidjs";
import type { ShimTag } from "../types";
import { parseBlockBody } from "./shared/passthrough-block";

const NO_LINK = { is_link: false, url: "", title: "" } as const;

export default {
	type: "tag",
	name: "paginate",
	status: "mock",
	description:
		"Renders the body and exposes a `paginate` drop with `current_page`, `current_offset`, `page_size`, `items`, `pages`, `parts`, `previous`, and `next`. Always renders page 1 — the shim doesn't read query parameters or slice the collection. Accepts the `window_size` keyword for spec compatibility but doesn't apply it to the rendered `parts` array.",
	implementation: {
		parse(token, remainingTokens) {
			const tokenizer = token.tokenizer as Tokenizer;
			this.collectionToken = tokenizer.readValue();
			tokenizer.skipBlank();
			const by = tokenizer.readIdentifier();
			if (by.content !== "by") {
				throw new Error(`expected 'by' in {% paginate %}, got '${by.content}'`);
			}
			tokenizer.skipBlank();
			this.pageSizeToken = tokenizer.readValue();
			tokenizer.skipBlank();
			if (tokenizer.peek() === ",") tokenizer.advance();
			this.windowSizeToken = readWindowSize(tokenizer);
			this.templates = parseBlockBody(
				"paginate",
				this.liquid.parser,
				remainingTokens,
			);
		},
		*render(ctx, emitter): Generator<unknown, void, unknown> {
			const collection = (yield evalToken(
				this.collectionToken as ValueToken,
				ctx,
			)) as unknown;
			const pageSize = Number(
				yield evalToken(this.pageSizeToken as ValueToken, ctx),
			);
			// Evaluate `window_size` even though it doesn't change the output
			// — keeps any in-arg variable references from being silently
			// undefined and surfaces type errors at the same point Shopify
			// would.
			if (this.windowSizeToken) {
				yield evalToken(this.windowSizeToken as ValueToken, ctx);
			}
			const items = Array.isArray(collection) ? collection.length : 0;
			const pages = Math.max(1, Math.ceil(items / Math.max(1, pageSize)));

			ctx.push({
				paginate: {
					current_page: 1,
					current_offset: 0,
					page_size: pageSize,
					items,
					pages,
					parts: buildParts(pages),
					previous: NO_LINK,
					next:
						pages > 1
							? { is_link: true, url: "?page=2", title: "Next »" }
							: NO_LINK,
				},
			});
			yield this.liquid.renderer.renderTemplates(
				this.templates as Template[],
				ctx,
				emitter,
			);
			ctx.pop();
		},
	},
} satisfies ShimTag;

function buildParts(pages: number): Array<{
	title: string;
	url: string;
	is_link: boolean;
}> {
	const parts: Array<{ title: string; url: string; is_link: boolean }> = [];
	for (let page = 1; page <= pages; page++) {
		parts.push({
			title: String(page),
			url: page === 1 ? "" : `?page=${page}`,
			is_link: page !== 1,
		});
	}
	return parts;
}

/**
 * Reads the optional `window_size: N` keyword. Spec defines no other
 * keyword arguments for `paginate`, so anything else throws.
 */
function readWindowSize(tokenizer: Tokenizer): ValueToken | undefined {
	tokenizer.skipBlank();
	if (tokenizer.end()) return undefined;
	const name = tokenizer.readIdentifier().content;
	if (!name) return undefined;
	if (name !== "window_size") {
		throw new Error(
			`unknown {% paginate %} keyword '${name}' — expected 'window_size'`,
		);
	}
	tokenizer.skipBlank();
	if (tokenizer.peek() !== ":") {
		throw new Error("expected ':' after 'window_size'");
	}
	tokenizer.advance();
	tokenizer.skipBlank();
	return tokenizer.readValue();
}
