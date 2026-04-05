import type { Liquid } from "liquidjs";
import type { ShimTag } from "./shims";

export const tags: ShimTag[] = [
	{
		type: "tag",
		name: "schema",
		status: "mock",
		implementation: tagNoOp("schema"),
	},
];

export function registerDefaultTags(engine: Liquid): void {
	for (const tag of tags) {
		engine.registerTag(tag.name, tag.implementation);
	}
}

type TagImplementation = ShimTag["implementation"];

/** Creates a no-op block tag implementation that silently consumes its content. */
function tagNoOp(name: string): TagImplementation {
	return {
		parse(_token, remainingTokens) {
			while (remainingTokens.length) {
				const next = remainingTokens.shift();
				if (next && "name" in next && next.name === `end${name}`) break;
			}
		},
		render() {},
	};
}
