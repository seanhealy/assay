import type { ShimFilter } from "../types";
import { attributes, keywordArgs } from "./shared/html";

export default {
	type: "filter",
	name: "image_tag",
	status: "mock",
	implementation: (value, ...args) => {
		const src = String(value ?? "");
		const kwargs = keywordArgs(args);
		const { alt, srcset, ...rest } = kwargs;
		return `<img${attributes({
			src,
			alt: alt ?? "",
			srcset: "srcset" in kwargs ? srcset : src,
			...rest,
		})}>`;
	},
} satisfies ShimFilter;
