import type { ShimFilter } from "../types";

const PIXEL =
	"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

export default {
	type: "filter",
	name: "image_url",
	status: "mock",
	implementation: (_value, ...args) => {
		const params = new URLSearchParams();
		for (const arg of args) {
			if (Array.isArray(arg)) {
				params.set(String(arg[0]), String(arg[1]));
			}
		}
		const fragment = params.toString();
		return fragment ? `${PIXEL}#${fragment}` : PIXEL;
	},
} satisfies ShimFilter;
