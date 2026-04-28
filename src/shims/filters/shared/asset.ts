// Injected at compile time by Vite's `define`. (see plugin.ts)
declare const __ASSAY_ASSET_PATH__: string;

export function assetUrl(value: unknown): string {
	return `/${__ASSAY_ASSET_PATH__}/${String(value)}`;
}
