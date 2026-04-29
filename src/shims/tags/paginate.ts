import type { Template, Tokenizer, ValueToken } from "liquidjs";
import { evalToken } from "liquidjs";
import type { ShimTag } from "../types";
import { parseBlockBody } from "./shared/passthrough-block";

export default {
	type: "tag",
	name: "paginate",
	status: "mock",
	description:
		"Renders the body and exposes a `paginate` drop with `current_page`, `pages`, `items`, `previous`, and `next`. Always renders page 1 — the shim doesn't read query parameters or slice the collection.",
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
			const items = countItems(collection);
			const pages = Math.max(1, Math.ceil(items / Math.max(1, pageSize)));
			const paginate = {
				current_page: 1,
				current_offset: 0,
				items,
				pages,
				page_size: pageSize,
				previous: { is_link: false, url: "", title: "" },
				next:
					pages > 1
						? {
								is_link: true,
								url: "?page=2",
								title: "Next »",
							}
						: { is_link: false, url: "", title: "" },
				parts: buildParts(pages),
			};

			ctx.push({ paginate });
			yield this.liquid.renderer.renderTemplates(
				this.templates as Template[],
				ctx,
				emitter,
			);
			ctx.pop();
		},
	},
} satisfies ShimTag;

function countItems(collection: unknown): number {
	if (Array.isArray(collection)) return collection.length;
	if (collection && typeof collection === "object") {
		const candidate = collection as {
			size?: unknown;
			length?: unknown;
		};
		if (typeof candidate.size === "number") return candidate.size;
		if (typeof candidate.length === "number") return candidate.length;
	}
	return 0;
}

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
