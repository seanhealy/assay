import { Liquid } from "liquidjs";
import { LIQUID_URL_PREFIX } from "./constants";
import { createFetchFS } from "./fs-adapter";
import { registerDefaultFilters, registerDefaultTags } from "./shims";

export interface RenderSnippetOptions {
	/** Wait for specific custom elements to be defined before returning */
	waitForElements?: string[];
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
	const engine = getEngine();

	// Clean up previous test render
	const existing = document.querySelector("[data-testroot]");
	if (existing) existing.remove();

	// Render Liquid → HTML string
	const html = await engine.renderFile(file, data);

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

let engine: Liquid | undefined;

/** Returns the current LiquidJS engine, creating one if needed. */
function getEngine(): Liquid {
	return engine ?? createEngine();
}

function createEngine(): Liquid {
	const fs = createFetchFS(LIQUID_URL_PREFIX);

	engine = new Liquid({
		fs,
		root: "",
		partials: "",
		extname: ".liquid",
	});

	registerDefaultFilters(engine);
	registerDefaultTags(engine);

	return engine;
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
