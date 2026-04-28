import type { ShimFilter } from "../types";
import { translate } from "./shared/translate";

export default {
	type: "filter",
	name: "t",
	status: "mock",
	implementation: translate,
} satisfies ShimFilter;
