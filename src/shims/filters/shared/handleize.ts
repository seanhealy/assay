import { deburr } from "es-toolkit/string";

/**
 * Shopify's `handleize` lowercases first, then collapses any run of
 * non-alphanumeric characters into a single `-`, trimming leading/trailing
 * hyphens. Notably it does *not* split on case boundaries — `handleize`
 * applied to `"HelloWorld"` returns `"helloworld"`, not `"hello-world"`.
 * `es-toolkit`'s `kebabCase` does split on case, so we can't reuse it; we
 * lean on `deburr` for accents and roll the rest as a regex.
 */
export function handleize(value: unknown): string {
	return deburr(String(value ?? ""))
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}
