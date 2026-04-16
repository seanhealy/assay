import { assayPreset } from "./src/preset";

export default assayPreset(
	{
		liquidPaths: ["./tests/fixtures/snippets", "./tests/fixtures/sections"],
		assetsPath: "tests/fixtures/assets",
	},
	{
		test: {
			include: ["tests/**/*.test.ts"],
		},
	},
);
