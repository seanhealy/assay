import type { ShimFilter } from "../types";
import { assetUrl } from "./shared/asset";

export default {
	type: "filter",
	name: "asset_img_url",
	status: "mock",
	implementation: assetUrl,
} satisfies ShimFilter;
