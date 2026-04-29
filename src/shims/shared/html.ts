import { escape as escapeHtml } from "es-toolkit/string";
import { toValue } from "liquidjs";

/**
 * Builds an HTML attribute string from a record of `name → value`. Skips any
 * entry whose value is `undefined`, `null`, or `false` — including LiquidJS
 * Drops (e.g. `nil`) which unwrap to `null` via `toValue`. `true` collapses
 * to a boolean attribute (just the name). All values are HTML-escaped so the
 * output is safe inside a quoted attribute. The result has a leading space
 * when non-empty so it slots cleanly into a tag like `<img${attrs}>`.
 */
export function attributes(values: Record<string, unknown>): string {
	const parts: string[] = [];
	for (const [name, raw] of Object.entries(values)) {
		const value = toValue(raw);
		if (value === undefined || value === null || value === false) continue;
		if (value === true) parts.push(name);
		else parts.push(`${name}="${escapeHtml(String(value))}"`);
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
