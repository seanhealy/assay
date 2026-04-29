import { resolve } from "node:path";
import { assayPreset } from "./src/preset";

export default assayPreset(
	{
		liquidPaths: ["./tests/fixtures/snippets", "./tests/fixtures/sections"],
		assetsPath: "tests/fixtures/assets",
	},
	{
		resolve: {
			alias: {
				"@": resolve(import.meta.dirname, "src"),
			},
		},
		test: {
			include: ["tests/**/*.test.ts", "src/**/*.test.ts"],
		},
	},
);
