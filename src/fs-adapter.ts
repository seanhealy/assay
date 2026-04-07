import type { FS } from "liquidjs";

const templateMocks = new Map<string, string>();

export function mockTemplate(name: string, template: string): void {
	templateMocks.set(name, template);
}

export function unmockTemplate(name: string): void {
	templateMocks.delete(name);
}

export function createFetchFS(urlPrefix: string): FS {
	return {
		sep: "/",

		resolve(dir: string, file: string, ext: string): string {
			const path = file.endsWith(ext) ? file : `${file}${ext}`;
			if (path.startsWith("/")) return `${urlPrefix}${path.slice(1)}`;
			return `${urlPrefix}${dir ? `${dir}/` : ""}${path}`;
		},

		async exists(): Promise<boolean> {
			return true;
		},

		async readFile(filepath: string): Promise<string> {
			const name = extractTemplateName(filepath);
			if (templateMocks.has(name)) return templateMocks.get(name) as string;

			const res = await fetch(filepath);
			if (!res.ok) throw new Error(`Template not found: ${filepath}`);
			return res.text();
		},

		existsSync(): boolean {
			throw new Error("Sync operations not supported in browser");
		},

		readFileSync(): string {
			throw new Error("Sync operations not supported in browser");
		},

		contains(): boolean {
			return true;
		},

		dirname(filepath: string): string {
			const parts = filepath.split("/");
			parts.pop();
			return parts.join("/");
		},
	};
}

/** Extracts the template name from a full URL path (e.g., "/__assay__/button.liquid" → "button") */
function extractTemplateName(filepath: string): string {
	const filename = filepath.split("/").pop() ?? filepath;
	return filename.replace(/\.liquid$/, "");
}
