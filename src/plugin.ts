import { readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import type { Plugin } from "vite";
import { LIQUID_URL_PREFIX } from "./constants";

const VIRTUAL_CONFIG_ID = "virtual:assay-config";
const RESOLVED_VIRTUAL_CONFIG_ID = `\0${VIRTUAL_CONFIG_ID}`;

export function assayPlugin(liquidPaths: string[]): Plugin {
	const resolvedPaths = liquidPaths.map((p) => resolve(p));

	return {
		name: "assay-liquid",

		resolveId(id) {
			if (id === VIRTUAL_CONFIG_ID) {
				return RESOLVED_VIRTUAL_CONFIG_ID;
			}
		},

		load(id) {
			if (id === RESOLVED_VIRTUAL_CONFIG_ID) {
				return [
					`export const liquidPaths = ${JSON.stringify(resolvedPaths)};`,
					`export const urlPrefix = ${JSON.stringify(LIQUID_URL_PREFIX)};`,
				].join("\n");
			}
		},

		configureServer(server) {
			server.middlewares.use(async (req, res, next) => {
				if (!req.url?.startsWith(LIQUID_URL_PREFIX)) {
					next();
					return;
				}

				const relativePath = decodeURIComponent(
					req.url.slice(LIQUID_URL_PREFIX.length),
				);

				for (const root of resolvedPaths) {
					const filePath = join(root, relativePath);

					// Prevent path traversal outside configured snippet paths
					if (!filePath.startsWith(root)) {
						continue;
					}

					try {
						const content = await readFile(filePath, "utf-8");
						res.setHeader("Content-Type", "text/plain");
						res.end(content);
						return;
					} catch {
						// File not found in this path, try the next one
					}
				}

				res.statusCode = 404;
				res.end(`Template not found: ${relativePath}`);
			});
		},
	};
}
