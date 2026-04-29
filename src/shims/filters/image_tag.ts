import type { ShimFilter } from "../types";
import { attributes, keywordArgs } from "./shared/html";

export default {
	type: "filter",
	name: "image_tag",
	status: "mock",
	implementation: (value, ...args) => {
		const src = String(value ?? "");
		const { srcset, alt, ...rest } = keywordArgs(args);
		return `<img${attributes({
			src,
			alt: alt ?? "",
			srcset: srcset === undefined ? src : srcset,
			...rest,
		})}>`;
	},
} satisfies ShimFilter;
