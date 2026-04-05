#!/usr/bin/env node

import { audit } from "./audit";

const command = process.argv[2];

if (command === "audit") {
	audit(process.argv.slice(3));
} else {
	console.error(`Usage: assay <command>

Commands:
  audit <path>  Audit Liquid usage and Assay compatibility in a theme

Options:
  --json        Output as JSON
  --output <f>  Write markdown to a file`);
	process.exit(command ? 1 : 0);
}
