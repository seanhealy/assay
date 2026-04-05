import { assayPreset } from "@augeo/assay/preset";

export default assayPreset(
	{
		liquidPaths: ["./theme/snippets", "./theme/sections"],
		assetsPath: "theme/assets",
	},
	{ test: { setupFiles: ["./tests/setup.ts"] } },
);
