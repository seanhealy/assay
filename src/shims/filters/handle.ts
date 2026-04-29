import type { ShimFilter } from "../types";
import { handleize } from "./shared/handleize";

export default {
	type: "filter",
	name: "handle",
	status: "parity",
	implementation: handleize,
} satisfies ShimFilter;
