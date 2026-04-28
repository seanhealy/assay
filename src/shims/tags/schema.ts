import type { ShimTag } from "../types";
import { noOpBlock } from "./shared/no-op";

export default {
	type: "tag",
	name: "schema",
	status: "mock",
	description: "Section and block settings JSON. Silently ignored.",
	implementation: noOpBlock("schema"),
} satisfies ShimTag;
