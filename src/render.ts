import { Liquid } from "liquidjs";
import { LIQUID_URL_PREFIX } from "./constants";
import { registerDefaultFilters } from "./filters";
import { createFetchFS } from "./fs-adapter";

export interface RenderSnippetOptions {
	/** Wait for specific custom elements to be defined before returning */
	waitForElements?: string[];
}

let engine: Liquid | undefined;

/**
 * Creates and configures a new LiquidJS engine instance.
 * Called automatically on first render, but can be called
 * manually for custom configuration.
 */
function createEngine(): Liquid {
	const fs = createFetchFS(LIQUID_URL_PREFIX);

	engine = new Liquid({
		fs,
		root: "",
		partials: "",
		extname: ".liquid",
	});

	registerDefaultFilters(engine);
	registerTagNoOp("schema");

	return engine;
}

/** Returns the current LiquidJS engine, creating one if needed. */
function getEngine(): Liquid {
	return engine ?? createEngine();
}

/**
 * Renders a Liquid template into the live browser DOM.
 *
 * @param file - Template filename (without extension)
 * @param data - Template variables passed to the Liquid template
 * @param options - Additional rendering options
 * @returns The container HTMLElement wrapping the rendered output
 *
 * @example
 * ```ts
 * const container = await renderSnippet('button', {
 *   text: 'Click me',
 *   variant: 'primary',
 * });
 * ```
 */
export async function renderSnippet(
	file: string,
	data: Record<string, unknown> = {},
	options: RenderSnippetOptions = {},
): Promise<HTMLElement> {
	const { waitForElements = [] } = options;
	const eng = getEngine();

	// Clean up previous test render
	const existing = document.querySelector("[data-testroot]");
	if (existing) existing.remove();

	// Render Liquid → HTML string
	const html = await eng.renderFile(file, data);

	// Inject into live browser DOM
	const container = document.createElement("div");
	container.setAttribute("data-testroot", "");
	container.innerHTML = html;
	activateScripts(container);
	document.body.appendChild(container);

	// Wait for specified custom elements to upgrade
	if (waitForElements.length > 0) {
		await Promise.all(
			waitForElements.map((tag) =>
				customElements.whenDefined(tag).catch(() => {
					// Silently ignore if element is not registered
				}),
			),
		);
	}

	return container;
}

/**
 * innerHTML doesn't execute script tags. This replaces each script
 * element with a fresh clone so the browser treats it as new and
 * executes it.
 */
function activateScripts(container: HTMLElement): void {
	for (const original of container.querySelectorAll("script")) {
		const script = document.createElement("script");
		for (const attr of original.attributes) {
			script.setAttribute(attr.name, attr.value);
		}
		script.textContent = original.textContent;
		original.replaceWith(script);
	}
}

/** Registers a block tag that silently consumes its content. */
function registerTagNoOp(name: string): void {
	registerTag(name, {
		parse(_token, remainingTokens) {
			while (remainingTokens.length) {
				const next = remainingTokens.shift();
				if (next && "name" in next && next.name === `end${name}`) break;
			}
		},
		render() {},
	});
}

/**
 * Registers a custom Liquid filter on the engine.
 *
 * @example
 * ```ts
 * registerFilter('highlight', (val) => `<mark>${val}</mark>`);
 * ```
 */
export function registerFilter(
	name: string,
	fn: (...args: unknown[]) => unknown,
): void {
	getEngine().registerFilter(name, fn);
}

/**
 * Registers a custom Liquid tag on the engine.
 * See LiquidJS docs for tag implementation details.
 */
export function registerTag(
	name: string,
	tag: Parameters<Liquid["registerTag"]>[1],
): void {
	getEngine().registerTag(name, tag);
}
