import { playwright } from "@vitest/browser-playwright";
import { assayPlugin } from "./plugin";
import type { LiquidPresetOptions } from "./types";

/**
 * Creates a Vitest `test` config object with browser mode, Playwright,
 * and the Assay Vite plugin pre-configured.
 *
 * @example
 * ```ts
 * import { defineConfig } from 'vitest/config';
 * import { liquidPreset } from '@augeo/assay/preset';
 *
 * export default defineConfig({
 *   test: liquidPreset({ liquidPaths: ['./snippets'] }),
 * });
 * ```
 */
export function liquidPreset(options: LiquidPresetOptions = {}) {
	const { liquidPaths = ["./snippets"] } = options;

	return {
		browser: {
			enabled: true,
			provider: playwright(),
			instances: [{ browser: "chromium" as const }],
		},
		plugins: [assayPlugin(liquidPaths)],
	};
}
