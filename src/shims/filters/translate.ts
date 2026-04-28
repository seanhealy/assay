import type { ShimFilter } from "../types";
import { translate } from "./shared/translate";

export default {
	type: "filter",
	name: "translate",
	status: "mock",
	implementation: translate,
} satisfies ShimFilter;
