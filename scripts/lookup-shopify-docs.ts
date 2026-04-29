/**
 * Looks up the Shopify docs entry for a single filter, tag, or object and
 * prints it as JSON to stdout. Used while authoring shims to verify behavior
 * against the official spec.
 *
 *   npm run docs:lookup filter handleize
 *   npm run docs:lookup tag paginate
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { unescape as unescapeHtml } from "es-toolkit/string";

const KINDS = {
	filter: "filters.json",
	tag: "tags.json",
	object: "objects.json",
} as const;
type Kind = keyof typeof KINDS;

const projectRoot = resolve(import.meta.dirname, "..");
const docsDataPath = resolve(projectRoot, "vendor/theme-liquid-docs/data");
const examplesPath = resolve(projectRoot, "vendor/shopify-examples");

main();

function main(): void {
	const [kindArg, name, ...rest] = process.argv.slice(2);

	if (!kindArg || !name || rest.length) {
		console.error("Usage: docs:lookup <filter|tag|object> <name>");
		process.exit(1);
	}

	if (!isKind(kindArg)) {
		console.error(
			`Unknown kind "${kindArg}". Expected one of: ${Object.keys(KINDS).join(", ")}`,
		);
		process.exit(1);
	}

	const entries: { name: string }[] = JSON.parse(
		readFileSync(resolve(docsDataPath, KINDS[kindArg]), "utf-8"),
	);
	const entry = entries.find((candidate) => candidate.name === name);

	if (!entry) {
		console.error(`No ${kindArg} found in vendor docs for "${name}".`);
		process.exit(1);
	}

	const docsUrl = `https://shopify.dev/docs/api/liquid/${kindArg}s/${name}`;
	const decoded = decodeStrings(entry) as Record<string, unknown>;
	const renderedExamples = readRenderedExamples(kindArg, name);
	const merged: Record<string, unknown> = { docsUrl, ...decoded };
	if (renderedExamples) merged.renderedExamples = renderedExamples;

	console.log(JSON.stringify(merged, undefined, 2));
}

function readRenderedExamples(kind: Kind, name: string): unknown {
	const path = resolve(examplesPath, `${kind}s`, `${name}.json`);
	if (!existsSync(path)) return undefined;
	const file = JSON.parse(readFileSync(path, "utf-8")) as {
		renderedExamples?: unknown;
	};
	return file.renderedExamples;
}

function isKind(value: string): value is Kind {
	return value in KINDS;
}

function decodeStrings(value: unknown): unknown {
	if (typeof value === "string") return unescapeHtml(value);
	if (Array.isArray(value)) return value.map(decodeStrings);
	if (value && typeof value === "object") {
		const decoded: Record<string, unknown> = {};
		for (const [key, inner] of Object.entries(value)) {
			decoded[key] = decodeStrings(inner);
		}
		return decoded;
	}
	return value;
}
