import type { Template, Tokenizer, ValueToken } from "liquidjs";
import { evalToken } from "liquidjs";
import type { ShimTag } from "../types";
import { parseBlockBody } from "./shared/passthrough-block";

export default {
	type: "tag",
	name: "paginate",
	status: "mock",
	description:
		"Renders the body and exposes a `paginate` drop with `current_page`, `pages`, `items`, `parts`, `previous`, and `next`. Always renders page 1 — the shim doesn't read query parameters or slice the collection. The `window_size` option is parsed for compatibility but doesn't affect the rendered `parts` array.",
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
			this.optionTokens = readOptions(tokenizer);
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
			// Drain `window_size` and any other options so undefined values
			// don't crash the engine, then discard the result.
			for (const [, valueToken] of this.optionTokens as Array<
				[string, ValueToken]
			>) {
				yield evalToken(valueToken, ctx);
			}
			const items = Array.isArray(collection) ? collection.length : 0;
			const pages = Math.max(1, Math.ceil(items / Math.max(1, pageSize)));

			ctx.push({
				paginate: {
					current_page: 1,
					page_size: pageSize,
					items,
					pages,
					parts: buildParts(pages),
					previous: { is_link: false, url: "", title: "" },
					next:
						pages > 1
							? { is_link: true, url: "?page=2", title: "Next »" }
							: { is_link: false, url: "", title: "" },
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

function readOptions(tokenizer: Tokenizer): Array<[string, ValueToken]> {
	const result: Array<[string, ValueToken]> = [];
	while (!tokenizer.end()) {
		tokenizer.skipBlank();
		if (tokenizer.peek() === ",") {
			tokenizer.advance();
			tokenizer.skipBlank();
		}
		if (tokenizer.end()) break;
		const name = tokenizer.readIdentifier().content;
		tokenizer.skipBlank();
		if (!name || tokenizer.peek() !== ":") break;
		tokenizer.advance();
		tokenizer.skipBlank();
		const value = tokenizer.readValue();
		if (!value) break;
		result.push([name, value]);
	}
	return result;
}
