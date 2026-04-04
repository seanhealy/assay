import { defineConfig } from "tsdown";

export default defineConfig({
	entry: {
		index: "src/index.ts",
		preset: "src/preset.ts",
	},
	format: "esm",
	fixedExtension: false,
	dts: true,
	sourcemap: true,
	clean: true,
	target: "es2022",
	deps: {
		neverBundle: [/^[^./]/],
	},
});
