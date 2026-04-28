import type { ShimFilter } from "../types";

export default {
	type: "filter",
	name: "money",
	status: "mock",
	implementation: (value) => {
		if (typeof value === "number") return `$${(value / 100).toFixed(2)}`;
		return String(value ?? "");
	},
} satisfies ShimFilter;
