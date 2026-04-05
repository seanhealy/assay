import type { Liquid } from "liquidjs";
import type { ShimFilter } from "./types";

// Injected at compile time by Vite's `define`. (see plugin.ts)
declare const __ASSAY_ASSET_PATH__: string;

export const filters: ShimFilter[] = [
	{
		type: "filter",
		name: "money",
		status: "mock",
		implementation: (value: unknown): string => {
			if (typeof value === "number") return `$${(value / 100).toFixed(2)}`;
			return String(value ?? "");
		},
	},
	{
		type: "filter",
		name: "asset_url",
		status: "parity",
		implementation: assetUrl,
	},
	{
		type: "filter",
		name: "asset_img_url",
		status: "mock",
		implementation: assetUrl,
	},
];

export function registerDefaultFilters(engine: Liquid): void {
	for (const filter of filters) {
		engine.registerFilter(filter.name, filter.implementation);
	}
}

function assetUrl(value: unknown): string {
	return `/${__ASSAY_ASSET_PATH__}/${String(value)}`;
}
