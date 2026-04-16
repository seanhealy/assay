/**
 * Audit Liquid usage in a theme and report Assay compatibility.
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { Liquid } from "liquidjs";
import { filters as assayFilterShims } from "../shims/filters";
import { tags as assayTagShims } from "../shims/tags";
import {
	filterNames as shopifyFilterNames,
	objectNames as shopifyObjectNames,
	tagNames as shopifyTagNames,
} from "./shopify-names";
import { formatTable } from "./utilities/markdown-table";
import { statusIcon } from "./utilities/status";

interface AuditEntry {
	count: number;
	status: string | undefined;
}

type AuditSection = Record<string, AuditEntry>;

interface AuditResult {
	tags: AuditSection;
	filters: AuditSection;
	objects: AuditSection;
}

// Shared regex patterns
const LIQUID_OPEN = /\{%-?\s*liquid\b/;
const LIQUID_CLOSE = /-?%\}/;
const TAG_PATTERN = /\{%-?\s*(\w+)/g;
const FILTER_PATTERN = /\|\s*([a-z_]+)/g;

// Tags that are sub-tag syntax, not standalone
const EXCLUDED_TAGS = new Set(["else"]);

export function audit(args: string[]): void {
	const jsonOutput = args.includes("--json");
	const outputIndex = args.indexOf("--output");
	const outputPath = outputIndex !== -1 ? args[outputIndex + 1] : undefined;
	const themeRoot = resolve(args.find((arg) => !arg.startsWith("--")) ?? ".");

	const result = buildAudit(themeRoot);

	if (jsonOutput) {
		console.log(JSON.stringify(result, undefined, 2));
	} else {
		const markdown = buildMarkdown(result);
		if (outputPath) {
			writeFileSync(outputPath, markdown);
			console.error(`Written to ${outputPath}`);
		} else {
			console.log(markdown);
		}
	}
}

function buildAudit(themeRoot: string): AuditResult {
	const canonicalTags = new Set(
		shopifyTagNames.filter((name) => !EXCLUDED_TAGS.has(name)),
	);
	const canonicalFilters = new Set(shopifyFilterNames);
	const canonicalObjects = [...shopifyObjectNames];
	canonicalTags.add("schema");
	canonicalFilters.add("t");

	const engine = new Liquid();
	const coreFilterNames = new Set(Object.keys(engine.filters));
	const coreTagNames = new Set(Object.keys(engine.tags));
	const assayFilterMap = new Map(
		assayFilterShims.map((filter) => [filter.name, filter]),
	);
	const assayTagMap = new Map(assayTagShims.map((tag) => [tag.name, tag]));

	const files = findLiquidFiles(themeRoot);
	console.error(`Scanning ${files.length} .liquid files in ${themeRoot}...`);

	const tagCounts = countTags(files, canonicalTags);
	const filterCounts = countFilters(files, canonicalFilters);
	const liquidContext = extractLiquidContext(files);
	const objectCounts = countObjects(
		liquidContext,
		canonicalObjects,
		canonicalTags,
	);

	return {
		tags: enrichCounts(tagCounts, coreTagNames, assayTagMap),
		filters: enrichCounts(filterCounts, coreFilterNames, assayFilterMap),
		objects: enrichCounts(objectCounts, new Set(), new Map()),
	};
}

// --- Output ---

function buildMarkdown(result: AuditResult): string {
	const date = new Date().toISOString().split("T")[0];

	return [
		"# Liquid Usage",
		"",
		`Usage counts for Liquid tags, filters, and objects. Generated ${date}.`,
		"",
		"---",
		"",
		"## Tags",
		"",
		...buildUsageTable("Tag", result.tags),
		"",
		"## Filters",
		"",
		...buildUsageTable("Filter", result.filters),
		"",
		"## Objects",
		"",
		...buildSimpleTable("Object", result.objects),
		"",
	].join("\n");
}

function buildUsageTable(columnName: string, section: AuditSection): string[] {
	const headers = ["Count", columnName, ""];
	const rows = Object.entries(section).map(([name, { count, status }]) => [
		String(count),
		`\`${name}\``,
		statusIcon(status),
	]);
	return formatTable(headers, rows);
}

function buildSimpleTable(columnName: string, section: AuditSection): string[] {
	const headers = ["Count", columnName];
	const rows = Object.entries(section).map(([name, { count }]) => [
		String(count),
		`\`${name}\``,
	]);
	return formatTable(headers, rows);
}

// --- Counting ---

function countTags(
	liquidFiles: string[],
	tagNames: Set<string>,
): Map<string, number> {
	const counts = new Map<string, number>();

	for (const filepath of liquidFiles) {
		const text = readFileSync(filepath, "utf-8");
		const lines = text.split("\n");
		let inLiquidBlock = false;

		for (const line of lines) {
			if (!inLiquidBlock) {
				if (LIQUID_OPEN.test(line)) {
					increment(counts, "liquid");
					inLiquidBlock = true;
					if (LIQUID_CLOSE.test(line)) {
						inLiquidBlock = false;
					}
					continue;
				}

				for (const match of line.matchAll(TAG_PATTERN)) {
					const name = match[1];
					if (tagNames.has(name)) {
						increment(counts, name);
					}
				}
			} else {
				const stripped = line.trim();
				if (stripped) {
					const firstWord = stripped.split(/\s/)[0];
					if (tagNames.has(firstWord)) {
						increment(counts, firstWord);
					}
				}
				if (LIQUID_CLOSE.test(line)) {
					inLiquidBlock = false;
				}
			}
		}
	}

	return sortByCountDesc(counts);
}

function countFilters(
	liquidFiles: string[],
	filterNames: Set<string>,
): Map<string, number> {
	const counts = new Map<string, number>();

	for (const filepath of liquidFiles) {
		const text = readFileSync(filepath, "utf-8");
		for (const match of text.matchAll(FILTER_PATTERN)) {
			const name = match[1];
			if (filterNames.has(name)) {
				increment(counts, name);
			}
		}
	}

	return sortByCountDesc(counts);
}

function extractLiquidContext(liquidFiles: string[]): string {
	const outputPattern = /\{\{.*?\}\}/gs;
	const logicPattern = /\{%-?.*?-?%\}/gs;
	const parts: string[] = [];

	for (const filepath of liquidFiles) {
		const text = readFileSync(filepath, "utf-8");

		for (const match of text.matchAll(outputPattern)) {
			parts.push(match[0]);
		}
		for (const match of text.matchAll(logicPattern)) {
			parts.push(match[0]);
		}

		const lines = text.split("\n");
		let inLiquidBlock = false;

		for (const line of lines) {
			if (!inLiquidBlock) {
				if (LIQUID_OPEN.test(line)) {
					inLiquidBlock = true;
					if (LIQUID_CLOSE.test(line)) {
						inLiquidBlock = false;
					}
				}
			} else if (LIQUID_CLOSE.test(line)) {
				inLiquidBlock = false;
			} else {
				parts.push(line);
			}
		}
	}

	return parts.join("\n");
}

function countObjects(
	context: string,
	objectNames: string[],
	tagNames: Set<string>,
): Map<string, number> {
	const counts = new Map<string, number>();

	for (const name of objectNames) {
		const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const pattern = tagNames.has(name)
			? new RegExp(`\\b${escaped}\\.`, "g")
			: new RegExp(`\\b${escaped}\\b`, "g");

		const matches = context.match(pattern);
		if (matches && matches.length > 0) {
			counts.set(name, matches.length);
		}
	}

	return sortByCountDesc(counts);
}

// --- File discovery ---

function findLiquidFiles(root: string): string[] {
	const results: string[] = [];

	function walk(directory: string) {
		for (const entry of readdirSync(directory)) {
			const fullPath = join(directory, entry);
			const stat = statSync(fullPath);
			if (stat.isDirectory() && entry !== "node_modules") {
				walk(fullPath);
			} else if (entry.endsWith(".liquid")) {
				results.push(fullPath);
			}
		}
	}

	walk(root);
	return results.sort();
}

// --- Utilities ---

function increment(counts: Map<string, number>, key: string): void {
	counts.set(key, (counts.get(key) ?? 0) + 1);
}

function sortByCountDesc(counts: Map<string, number>): Map<string, number> {
	return new Map(
		[...counts.entries()].sort(([, first], [, second]) => second - first),
	);
}

function enrichCounts(
	counts: Map<string, number>,
	coreNames: Set<string>,
	shimMap: Map<string, { status: string }>,
): Record<string, { count: number; status: string | undefined }> {
	const result: Record<string, { count: number; status: string | undefined }> =
		{};
	for (const [name, count] of counts) {
		let status: string | undefined;
		if (coreNames.has(name)) {
			status = "parity";
		} else {
			const shim = shimMap.get(name);
			if (shim) status = shim.status;
		}
		result[name] = { count, status };
	}
	return result;
}
