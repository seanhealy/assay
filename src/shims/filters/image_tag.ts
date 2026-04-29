import { attributes, keywordArgs } from "../shared/html";
import type { ShimFilter } from "../types";

export default {
	type: "filter",
	name: "image_tag",
	status: "mock",
	implementation: (value, ...args) => {
		const src = String(value ?? "");
		const keywords = keywordArgs(args);
		const { alt, srcset, ...rest } = keywords;
		// `srcset` defaults to `src` when omitted, but `srcset: nil` should
		// remove the attribute. Distinguish "omitted" from "explicit nil" by
		// checking for the key — `attributes()` skips nil values.
		return `<img${attributes({
			src,
			alt: alt ?? "",
			srcset: "srcset" in keywords ? srcset : src,
			...rest,
		})}>`;
	},
} satisfies ShimFilter;
