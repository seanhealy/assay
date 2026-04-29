import { attributes } from "../shared/html";
import type { ShimFilter } from "../types";

export default {
	type: "filter",
	name: "placeholder_svg_tag",
	status: "mock",
	implementation: (value, ...args) => {
		const name = String(value ?? "");
		const className = typeof args[0] === "string" ? args[0] : undefined;
		return `<svg${attributes({
			xmlns: "http://www.w3.org/2000/svg",
			viewBox: "0 0 100 100",
			role: "img",
			"aria-label": name,
			class: className,
			"data-placeholder": name,
		})}><rect width="100" height="100" fill="#e6e6e6"/></svg>`;
	},
} satisfies ShimFilter;
