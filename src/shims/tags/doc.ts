import type { ShimTag } from "../types";
import { noOpBlock } from "./shared/no-op";

export default {
	type: "tag",
	name: "doc",
	status: "parity",
	description: "LiquidDoc comment block. Silently ignored.",
	implementation: noOpBlock("doc"),
} satisfies ShimTag;
