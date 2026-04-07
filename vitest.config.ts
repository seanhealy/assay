import { assayPreset } from "./src/preset";

export default assayPreset(
	{
		liquidPaths: ["./tests/fixtures/snippets", "./tests/fixtures/sections"],
	},
	{
		test: {
			include: ["tests/**/*.test.ts"],
		},
	},
);
