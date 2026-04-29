import { kebabCase } from "es-toolkit/string";

export function handleize(value: unknown): string {
	return kebabCase(String(value ?? ""));
}
