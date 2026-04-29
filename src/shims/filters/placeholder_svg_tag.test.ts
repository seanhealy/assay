// Shopify reference: https://shopify.dev/docs/api/liquid/filters/placeholder_svg_tag
// Real Shopify returns one of a fixed set of large illustration SVGs
// (`product-1`, `collection-2`, `image`, etc.). Reproducing the exact
// artwork is out of scope for tests, so the Assay shim returns a generic
// 100×100 grey square with the requested placeholder name preserved on
// `data-placeholder` and `aria-label`. The optional positional argument
// becomes the `class` attribute, matching Shopify's API.

import { beforeEach, describe, expect, it } from "vitest";
import { liquid, render } from "@";

describe("placeholder_svg_tag()", () => {
	let container: HTMLElement;

	describe("without arguments", () => {
		beforeEach(async () => {
			container = await render(
				liquid`{{ 'collection-1' | placeholder_svg_tag }}`,
			);
		});

		it("preserves the placeholder name on `data-placeholder`", () => {
			expect(
				container.querySelector("svg")?.getAttribute("data-placeholder"),
			).toBe("collection-1");
		});

		it("uses the placeholder name as `aria-label`", () => {
			expect(container.querySelector("svg")?.getAttribute("aria-label")).toBe(
				"collection-1",
			);
		});

		it("declares the SVG namespace", () => {
			expect(container.querySelector("svg")?.getAttribute("xmlns")).toBe(
				"http://www.w3.org/2000/svg",
			);
		});
	});

	describe("with a positional class argument", () => {
		beforeEach(async () => {
			container = await render(
				liquid`{{ 'collection-1' | placeholder_svg_tag: 'custom-class' }}`,
			);
		});

		it("applies the supplied value as the `class` attribute", () => {
			expect(container.querySelector("svg")?.getAttribute("class")).toBe(
				"custom-class",
			);
		});
	});
});
