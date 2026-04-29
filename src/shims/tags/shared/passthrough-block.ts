import type { Template, TopLevelToken } from "liquidjs";

/**
 * Parses tokens up to `{% end<name> %}`, parsing each child via the engine's
 * parser. Returns the parsed children and consumes the closing tag from
 * `remainingTokens`. Use from a tag's `parse` callback when the tag is a
 * block whose body should be re-rendered (style, form, paginate, etc.).
 */
export function parseBlockBody(
	name: string,
	parser: {
		parseToken(token: TopLevelToken, tokens: TopLevelToken[]): Template;
	},
	remainingTokens: TopLevelToken[],
): Template[] {
	const endName = `end${name}`;
	const templates: Template[] = [];
	while (remainingTokens.length) {
		const next = remainingTokens.shift() as TopLevelToken;
		if ("name" in next && next.name === endName) return templates;
		templates.push(parser.parseToken(next, remainingTokens));
	}
	throw new Error(`tag {% ${name} %} not closed`);
}
