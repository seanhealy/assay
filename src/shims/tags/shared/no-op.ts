import type { ShimTag } from "../../types";

/**
 * Builds a block-tag implementation that silently consumes everything between
 * `{% name %}` and `{% endname %}` and renders nothing. Useful for theme-only
 * tags whose runtime behavior is irrelevant in tests (schema, doc, etc.).
 */
export function noOpBlock(name: string): ShimTag["implementation"] {
	const endName = `end${name}`;
	return {
		parse(_token, remainingTokens) {
			while (remainingTokens.length) {
				const next = remainingTokens.shift();
				if (next && "name" in next && next.name === endName) break;
			}
		},
		render() {},
	};
}
