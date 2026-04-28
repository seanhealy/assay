import type { ShimFilter } from "../types";
import { assetUrl } from "./shared/asset";

export default {
	type: "filter",
	name: "inline_asset_content",
	status: "parity",
	implementation: async (value) => {
		const url = assetUrl(value);
		const response = await fetch(url);
		if (!response.ok) return "";
		return response.text();
	},
} satisfies ShimFilter;
