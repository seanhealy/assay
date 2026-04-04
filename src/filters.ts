import type { Liquid } from "liquidjs";

// Injected at compile time by Vite's `define`. (see plugin.ts)
declare const __ASSAY_ASSET_PATH__: string;

export function registerDefaultFilters(engine: Liquid): void {
	engine.registerFilter("money", (value: unknown): string => {
		if (typeof value === "number") return `$${(value / 100).toFixed(2)}`;
		return String(value ?? "");
	});

	engine.registerFilter(
		"asset_url",
		(value: unknown): string => `/${__ASSAY_ASSET_PATH__}/${String(value)}`,
	);
}
