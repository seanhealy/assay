import { attributes, keywordArgs } from "../shared/html";
import type { ShimFilter } from "../types";

export default {
	type: "filter",
	name: "stylesheet_tag",
	status: "parity",
	implementation: (value, ...args) => {
		// Spec: positional `media` (string), keyword `preload` (boolean).
		const positional = args.find((arg) => typeof arg === "string");
		const { preload } = keywordArgs(args);
		return `<link${attributes({
			href: String(value ?? ""),
			rel: "stylesheet",
			type: "text/css",
			media: positional ?? "all",
			preload,
		})} />`;
	},
} satisfies ShimFilter;
