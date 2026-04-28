import type { ShimFilter } from "../types";
import { assetUrl } from "./shared/asset";

export default {
	type: "filter",
	name: "asset_url",
	status: "parity",
	implementation: assetUrl,
} satisfies ShimFilter;
