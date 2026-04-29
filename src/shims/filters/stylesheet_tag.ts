import type { ShimFilter } from "../types";
import { attributes, keywordArgs } from "./shared/html";

export default {
	type: "filter",
	name: "stylesheet_tag",
	status: "parity",
	implementation: (value, ...args) => {
		const positional = args.find((arg) => !Array.isArray(arg));
		const keywords = keywordArgs(args);
		const media = (positional as string | undefined) ?? "all";
		return `<link${attributes({
			href: String(value ?? ""),
			rel: "stylesheet",
			type: "text/css",
			media,
			...keywords,
		})}>`;
	},
} satisfies ShimFilter;
