import { playwright } from "@vitest/browser-playwright";
import type { ViteUserConfig } from "vitest/config";
import { assayPlugin } from "./plugin";
import type { LiquidPresetOptions } from "./types";

/**
 * Creates a full Vitest config with browser mode, Playwright,
 * and the Assay Vite plugin pre-configured.
 *
 * @param options - Assay-specific options
 * @param overrides - Vitest config overrides, merged with defaults
 *
 * @example
 * ```ts
 * import { assayPreset } from '@augeo/assay/preset';
 *
 * export default assayPreset({ liquidPaths: ['./snippets'] });
 * ```
 *
 * @example With overrides
 * ```ts
 * export default assayPreset(
 *   { liquidPaths: ['./snippets'] },
 *   { test: { browser: { headless: false } } },
 * );
 * ```
 */
export function assayPreset(
	options: LiquidPresetOptions = {},
	overrides: ViteUserConfig = {},
): ViteUserConfig {
	const { liquidPaths = ["./snippets"], assetsPath = "assets" } = options;
	const { test: testOverrides, ...restOverrides } = overrides;
	const { browser: browserOverrides, ...restTestOverrides } =
		testOverrides ?? {};

	return {
		plugins: [assayPlugin(liquidPaths, assetsPath)],
		test: {
			browser: {
				enabled: true,
				provider: playwright(),
				headless: true,
				instances: [{ browser: "chromium" }],
				...browserOverrides,
			},
			...restTestOverrides,
		},
		...restOverrides,
	};
}
