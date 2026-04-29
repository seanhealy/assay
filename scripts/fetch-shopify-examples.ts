/**
 * Fetches the rendered Code/Data/Output examples from shopify.dev's markdown
 * endpoint for filters and tags, and writes one JSON file per item under
 * vendor/shopify-examples/{filters,tags}/{name}.json (alongside the raw .md).
 *
 * Object docs are also fetched as `.md` reference files but not parsed —
 * objects are mocked via TypeScript types, not shimmed at runtime.
 *
 *   npm run docs:fetchExample all
 *   npm run docs:fetchExample missing
 *   npm run docs:fetchExample filter append
 *
 * Add --parse to skip the network and re-derive .json from local .md files
 * (useful when the parser logic changes). The leading `--` is needed so npm
 * forwards the flag through to the script:
 *
 *   npm run docs:fetchExample -- --parse
 *   npm run docs:fetchExample -- --parse filter append
 */

import {
	existsSync,
	mkdirSync,
	readdirSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";

const KINDS = {
	filter: "filters.json",
	tag: "tags.json",
	object: "objects.json",
} as const;
type Kind = keyof typeof KINDS;

// Objects are mocked via TypeScript types (generated from objects.json), not
// shimmed at runtime, so we don't parse their examples into JSON. The raw
// `.md` files are still fetched as reference material.
const KINDS_WITH_JSON: Kind[] = ["filter", "tag"];

const FETCH_DELAY_MS = 500;

interface RenderedExample {
	name?: string;
	code: string;
	data?: unknown;
	output?: string;
}

interface ExamplesFile {
	kind: Kind;
	name: string;
	docsUrl: string;
	renderedExamples: RenderedExample[];
}

interface Fence {
	openIdx: number;
	closeIdx: number;
	lang: string;
	indent: number;
}

const projectRoot = resolve(import.meta.dirname, "..");
const vendorDataPath = resolve(projectRoot, "vendor/theme-liquid-docs/data");
const examplesPath = resolve(projectRoot, "vendor/shopify-examples");

main();

// --- Entry point ----------------------------------------------------------

async function main(): Promise<void> {
	const rawArgs = process.argv.slice(2);
	const parseFlag = rawArgs.includes("--parse");
	const args = rawArgs.filter((arg) => arg !== "--parse");

	if (parseFlag) {
		if (args.length === 0) {
			parseAll();
			return;
		}
		if (args.length === 2 && isKind(args[0])) {
			if (!KINDS_WITH_JSON.includes(args[0])) {
				console.error(
					`Cannot parse ${args[0]}s — they are mocked via types, not parsed to JSON.`,
				);
				process.exit(1);
			}
			parseOne(args[0], args[1]);
			return;
		}
		console.error("Usage: docs:fetchExample --parse [<filter|tag> <name>]");
		process.exit(1);
	}

	if (args[0] === "all" && args.length === 1) {
		await fetchAll({ skipExisting: false });
		return;
	}

	if (args[0] === "missing" && args.length === 1) {
		await fetchAll({ skipExisting: true });
		return;
	}

	if (args.length === 2 && isKind(args[0])) {
		const [kind, name] = args;
		await fetchOne(kind, name);
		return;
	}

	console.error(
		"Usage: docs:fetchExample [--parse] all | missing | <filter|tag|object> <name>",
	);
	process.exit(1);
}

// --- Network fetch --------------------------------------------------------

async function fetchAll(options: { skipExisting: boolean }): Promise<void> {
	for (const kind of Object.keys(KINDS) as Kind[]) {
		const names = listNames(kind);
		console.log(`\n# ${kind}s (${names.length})`);
		for (const [index, name] of names.entries()) {
			const progress = `[${index + 1}/${names.length}]`;
			if (options.skipExisting && existsAt(kind, name)) {
				console.log(`  ${progress} ${name} → already fetched`);
				continue;
			}
			try {
				const written = await fetchOne(kind, name, { quiet: true });
				console.log(`  ${progress} ${name} → ${written ?? "skipped"}`);
			} catch (error) {
				console.warn(`  ${progress} ${name} ✗ ${(error as Error).message}`);
			}
			await sleep(FETCH_DELAY_MS);
		}
	}
}

async function fetchOne(
	kind: Kind,
	name: string,
	options: { quiet?: boolean } = {},
): Promise<string | undefined> {
	const mdUrl = `https://shopify.dev/docs/api/liquid/${kind}s/${name}.md`;

	const response = await fetch(mdUrl);
	if (response.status === 404) {
		if (!options.quiet) console.warn(`No docs page for ${kind} "${name}"`);
		return undefined;
	}
	if (!response.ok) {
		throw new Error(`HTTP ${response.status} for ${mdUrl}`);
	}

	const markdown = await response.text();
	const mdPath = markdownPathFor(kind, name);
	writeFileEnsuringDir(mdPath, markdown);

	if (!KINDS_WITH_JSON.includes(kind)) {
		if (!options.quiet) {
			console.log(`Wrote ${mdPath} (md only — ${kind}s are mocked via types)`);
		}
		return mdPath;
	}
	return writeJsonFromMarkdown(kind, name, markdown, options);
}

function existsAt(kind: Kind, name: string): boolean {
	if (!existsSync(markdownPathFor(kind, name))) return false;
	if (!KINDS_WITH_JSON.includes(kind)) return true;
	return existsSync(jsonPathFor(kind, name));
}

// --- Local re-parse (--parse) --------------------------------------------

function parseAll(): void {
	for (const kind of KINDS_WITH_JSON) {
		const dir = resolve(examplesPath, `${kind}s`);
		if (!existsSync(dir)) continue;
		const names = readdirSync(dir)
			.filter((entry) => entry.endsWith(".md"))
			.map((entry) => entry.replace(/\.md$/, ""))
			.sort();
		console.log(`\n# ${kind}s (${names.length})`);
		for (const [index, name] of names.entries()) {
			const progress = `[${index + 1}/${names.length}]`;
			try {
				const written = parseOne(kind, name, { quiet: true });
				console.log(`  ${progress} ${name} → ${written}`);
			} catch (error) {
				console.warn(`  ${progress} ${name} ✗ ${(error as Error).message}`);
			}
		}
	}
}

function parseOne(
	kind: Kind,
	name: string,
	options: { quiet?: boolean } = {},
): string {
	const mdPath = markdownPathFor(kind, name);
	if (!existsSync(mdPath)) {
		throw new Error(`No local .md for ${kind} "${name}" (${mdPath})`);
	}
	const markdown = readFileSync(mdPath, "utf-8");
	return writeJsonFromMarkdown(kind, name, markdown, options);
}

function writeJsonFromMarkdown(
	kind: Kind,
	name: string,
	markdown: string,
	options: { quiet?: boolean } = {},
): string {
	const renderedExamples = parseExamples(markdown);
	const file: ExamplesFile = {
		kind,
		name,
		docsUrl: `https://shopify.dev/docs/api/liquid/${kind}s/${name}`,
		renderedExamples,
	};

	const jsonPath = jsonPathFor(kind, name);
	writeFileEnsuringDir(jsonPath, `${JSON.stringify(file, undefined, 2)}\n`);

	if (!options.quiet) {
		const plural = renderedExamples.length === 1 ? "" : "s";
		console.log(
			`Wrote ${jsonPath} (${renderedExamples.length} example${plural})`,
		);
	}

	return jsonPath;
}

// --- Markdown → renderedExamples -----------------------------------------

function parseExamples(markdown: string): RenderedExample[] {
	const lines = markdown.split("\n");
	const codeHeadings = findHeadings(lines, "##### Code");

	const structured = codeHeadings.map((codeIdx, position) => {
		const nextCodeIdx = codeHeadings[position + 1] ?? lines.length;
		const previousCodeIdx = codeHeadings[position - 1] ?? -1;
		return parseStructuredExample(lines, codeIdx, nextCodeIdx, previousCodeIdx);
	});

	// Some pages (avatar, login_button, payment_terms, metaobject, etc.) have
	// bare ```liquid blocks without the `##### Code/Data/Output` triple. The
	// rendered shopify.dev page just shows them as code panels. Extract them
	// as fallback so we don't lose those examples.
	const consumed = collectStructuredLines(lines, codeHeadings);
	const bare = parseBareLiquidExamples(lines, consumed);

	return [...structured, ...bare];
}

function parseStructuredExample(
	lines: string[],
	codeIdx: number,
	endIdx: number,
	previousCodeIdx: number,
): RenderedExample {
	const example: RenderedExample = { code: "" };

	const variationName =
		previousCodeIdx >= 0
			? findPrecedingVariationName(lines, codeIdx, previousCodeIdx)
			: findFirstVariationName(lines, codeIdx);
	if (variationName) example.name = variationName;

	const codeFence = locateFence(lines, codeIdx + 1);
	if (codeFence) example.code = readFenceContent(lines, codeFence);

	const dataContent = readContentAfterHeading(
		lines,
		codeIdx + 1,
		endIdx,
		"##### Data",
	);
	if (dataContent !== undefined) {
		try {
			example.data = JSON.parse(dataContent);
		} catch {
			example.data = dataContent;
		}
	}

	const outputContent = readContentAfterHeading(
		lines,
		codeIdx + 1,
		endIdx,
		"##### Output",
	);
	if (outputContent !== undefined) example.output = outputContent;

	return example;
}

function parseBareLiquidExamples(
	lines: string[],
	consumed: Set<number>,
): RenderedExample[] {
	const blocks: { fence: Fence; content: string }[] = [];
	let cursor = 0;
	while (cursor < lines.length) {
		if (consumed.has(cursor) || lines[cursor].trim() !== "```liquid") {
			cursor++;
			continue;
		}
		const fence = locateFence(lines, cursor);
		if (!fence) {
			cursor++;
			continue;
		}
		const content = readFenceContent(lines, fence);
		// Only extract blocks containing actual Liquid syntax — skip illustrative
		// snippets (e.g. image_tag.md's preload section uses ```liquid for HTTP
		// header text with no Liquid tags).
		if (/\{[%{]/.test(content)) {
			blocks.push({ fence, content });
		}
		cursor = fence.closeIdx + 1;
	}

	const examples: RenderedExample[] = [];
	let position = 0;
	while (position < blocks.length) {
		const codeBlock = blocks[position];
		const nextBlock = blocks[position + 1];
		const isPair =
			nextBlock !== undefined &&
			isAdjacentBareBlock(
				lines,
				codeBlock.fence.closeIdx,
				nextBlock.fence.openIdx,
			);

		const example: RenderedExample = { code: codeBlock.content };
		const variationName = findBareVariationName(lines, codeBlock.fence.openIdx);
		if (variationName) example.name = variationName;

		if (isPair) {
			if (nextBlock.content !== codeBlock.content) {
				example.output = nextBlock.content;
			}
			position += 2;
		} else {
			position += 1;
		}
		examples.push(example);
	}
	return examples;
}

// --- Variation-name detection --------------------------------------------

function findPrecedingVariationName(
	lines: string[],
	codeIdx: number,
	floorIdx: number,
): string | undefined {
	for (let index = codeIdx - 1; index > floorIdx; index--) {
		const variation = matchVariationHeading(lines[index]);
		if (variation) return variation;
	}
	return undefined;
}

// For the first example, the rules are:
// - An `Example<Heading>` inline marker is always a variation name.
// - A `### foo` heading is a variation name when either (a) the page has no
//   top-level `## Syntax` heading at all (object docs, where every ### is a
//   section title for an example), or (b) there's a nested `## Syntax`
//   between the `### ` and the `##### Code` (form/comment-style tags).
// - Otherwise the `### ` is a page-level syntax keyword (style/for) and is
//   not a variation name.
function findFirstVariationName(
	lines: string[],
	codeIdx: number,
): string | undefined {
	for (let index = codeIdx - 1; index >= 0; index--) {
		const trimmed = lines[index].trim();
		const inline = matchInlineExampleHeading(trimmed);
		if (inline) return inline;
		const match = /^### ([^#].*)$/.exec(trimmed);
		if (!match) continue;

		const hasSyntaxBetween = lines
			.slice(index + 1, codeIdx)
			.some(isSyntaxHeading);
		const hasSyntaxBefore = lines.slice(0, index).some(isSyntaxHeading);
		if (hasSyntaxBetween || !hasSyntaxBefore) {
			return unescapeMarkdown(match[1].trim());
		}
		return undefined;
	}
	return undefined;
}

function findBareVariationName(
	lines: string[],
	openIdx: number,
): string | undefined {
	for (let index = openIdx - 1; index >= 0; index--) {
		const trimmed = lines[index].trim();
		if (trimmed.startsWith("##### ") || trimmed.startsWith("## ")) {
			return undefined;
		}
		const variation = matchVariationHeading(lines[index]);
		if (variation) return variation;
	}
	return undefined;
}

function matchVariationHeading(line: string): string | undefined {
	const trimmed = line.trim();
	const inline = matchInlineExampleHeading(trimmed);
	if (inline) return inline;
	const match = /^### ([^#].*)$/.exec(trimmed);
	if (match) return unescapeMarkdown(match[1].trim());
	return undefined;
}

// Object property docs and a few nested tag examples use an inline-prose
// section divider `Example<HeadingText>` (literally the word "Example"
// followed immediately by a capitalized title — no space between them). The
// docs site renders this with special styling but in markdown it's just text.
function matchInlineExampleHeading(line: string): string | undefined {
	const match = /^Example([A-Z].+)$/.exec(line);
	if (!match) return undefined;
	return unescapeMarkdown(match[1].trim());
}

// Two bare blocks are an "adjacent pair" if they're separated only by blank
// lines / prose (no other major structural markers like ##### Code, ### foo,
// or ## Syntax that would imply they belong to different example contexts).
function isAdjacentBareBlock(
	lines: string[],
	closeIdx: number,
	openIdx: number,
): boolean {
	for (let index = closeIdx + 1; index < openIdx; index++) {
		const trimmed = lines[index].trim();
		if (trimmed.startsWith("##### ") || trimmed.startsWith("## ")) return false;
		if (/^### [^#]/.test(trimmed)) return false;
		if (matchInlineExampleHeading(trimmed)) return false;
	}
	return true;
}

// --- Fenced-block helpers -------------------------------------------------

function locateFence(lines: string[], startIdx: number): Fence | undefined {
	for (let index = startIdx; index < lines.length; index++) {
		const line = lines[index];
		const trimmed = line.trim();
		if (trimmed.startsWith("```")) {
			const lang = trimmed.slice(3);
			const indent = line.length - line.trimStart().length;
			for (let inner = index + 1; inner < lines.length; inner++) {
				if (lines[inner].trim() === "```") {
					return { openIdx: index, closeIdx: inner, lang, indent };
				}
			}
			return undefined;
		}
		if (trimmed.length > 0 && !trimmed.startsWith("#")) return undefined;
	}
	return undefined;
}

function readFenceContent(lines: string[], fence: Fence): string {
	const contentLines: string[] = [];
	for (let inner = fence.openIdx + 1; inner < fence.closeIdx; inner++) {
		contentLines.push(dedentLine(lines[inner], fence.indent));
	}
	return contentLines.join("\n");
}

function readContentAfterHeading(
	lines: string[],
	startIdx: number,
	endIdx: number,
	heading: string,
): string | undefined {
	for (let index = startIdx; index < endIdx; index++) {
		if (lines[index].trim() !== heading) continue;
		const fence = locateFence(lines, index + 1);
		if (fence) return readFenceContent(lines, fence);
	}
	return undefined;
}

function collectStructuredLines(
	lines: string[],
	codeHeadings: number[],
): Set<number> {
	const consumed = new Set<number>();
	for (let i = 0; i < codeHeadings.length; i++) {
		const codeIdx = codeHeadings[i];
		const endIdx = codeHeadings[i + 1] ?? lines.length;
		consumed.add(codeIdx);
		markFence(consumed, locateFence(lines, codeIdx + 1));
		for (let line = codeIdx + 1; line < endIdx; line++) {
			const trimmed = lines[line].trim();
			if (trimmed === "##### Data" || trimmed === "##### Output") {
				consumed.add(line);
				markFence(consumed, locateFence(lines, line + 1));
			}
		}
	}
	return consumed;
}

function markFence(consumed: Set<number>, fence: Fence | undefined): void {
	if (!fence) return;
	for (let index = fence.openIdx; index <= fence.closeIdx; index++) {
		consumed.add(index);
	}
}

function dedentLine(line: string, amount: number): string {
	if (amount === 0) return line;
	let stripped = 0;
	let cursor = 0;
	while (cursor < line.length && stripped < amount && line[cursor] === " ") {
		cursor++;
		stripped++;
	}
	return line.slice(cursor);
}

// Strips markdown backslash-escapes (e.g. `CSS\_rules` -> `CSS_rules`).
function unescapeMarkdown(text: string): string {
	return text.replace(/\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g, "$1");
}

function isSyntaxHeading(line: string): boolean {
	return /^## Syntax\b/.test(line.trim());
}

function findHeadings(lines: string[], heading: string): number[] {
	return lines
		.map((line, index) => (line.trim() === heading ? index : -1))
		.filter((index) => index !== -1);
}

// --- Path / IO helpers ----------------------------------------------------

function jsonPathFor(kind: Kind, name: string): string {
	return resolve(examplesPath, `${kind}s`, `${name}.json`);
}

function markdownPathFor(kind: Kind, name: string): string {
	return resolve(examplesPath, `${kind}s`, `${name}.md`);
}

function writeFileEnsuringDir(path: string, content: string): void {
	mkdirSync(dirname(path), { recursive: true });
	writeFileSync(path, content);
}

function listNames(kind: Kind): string[] {
	const entries: { name: string }[] = JSON.parse(
		readFileSync(resolve(vendorDataPath, KINDS[kind]), "utf-8"),
	);
	return entries.map((entry) => entry.name).sort();
}

function isKind(value: string): value is Kind {
	return value in KINDS;
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolveSleep) => setTimeout(resolveSleep, ms));
}
