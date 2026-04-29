import type { Template } from "liquidjs";
import type { ShimTag } from "../types";
import { parseBlockBody } from "./shared/passthrough-block";

export default {
	type: "tag",
	name: "style",
	status: "parity",
	description:
		"Wraps the body in `<style data-shopify>…</style>`, rendering inner Liquid first.",
	implementation: {
		parse(_token, remainingTokens) {
			this.templates = parseBlockBody(
				"style",
				this.liquid.parser,
				remainingTokens,
			);
		},
		*render(ctx, emitter) {
			emitter.write("<style data-shopify>");
			yield this.liquid.renderer.renderTemplates(
				this.templates as Template[],
				ctx,
				emitter,
			);
			emitter.write("</style>");
		},
	},
} satisfies ShimTag;
