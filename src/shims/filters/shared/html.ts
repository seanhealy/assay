/**
 * Builds an HTML attribute string from a record of `name → value`. Skips any
 * entry whose value is `undefined`, `null`, or `false`. `true` collapses to a
 * boolean attribute (just the name). All values are escaped to keep the
 * output safe inside a quoted attribute. Returns the attributes joined by
 * single spaces, with a leading space when non-empty so it slots cleanly into
 * a tag like `<img${attrs}>`.
 */
export function attributes(values: Record<string, unknown>): string {
	const parts: string[] = [];
	for (const [name, value] of Object.entries(values)) {
		if (value === undefined || value === null || value === false) continue;
		if (value === true) parts.push(name);
		else parts.push(`${name}="${escapeAttribute(String(value))}"`);
	}
	return parts.length === 0 ? "" : ` ${parts.join(" ")}`;
}

/**
 * Collects keyword arguments that LiquidJS passes to filters as
 * `[name, value]` tuples into a plain record. Bare positional arguments are
 * ignored.
 */
export function keywordArgs(args: unknown[]): Record<string, unknown> {
	const result: Record<string, unknown> = {};
	for (const arg of args) {
		if (Array.isArray(arg) && typeof arg[0] === "string") {
			result[arg[0]] = arg[1];
		}
	}
	return result;
}

function escapeAttribute(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/"/g, "&quot;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}
