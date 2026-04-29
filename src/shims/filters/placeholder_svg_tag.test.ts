// Shopify reference: https://shopify.dev/docs/api/liquid/filters/placeholder_svg_tag
// Real Shopify returns one of a fixed set of large illustration SVGs (`product-1`,
// `collection-2`, `image`, etc.). Reproducing the exact artwork is out of scope
// for tests, so the Assay shim returns a generic 100×100 grey square with the
// requested placeholder name preserved on `data-placeholder` and `aria-label`.
// The optional positional argument becomes the `class` attribute, matching
// Shopify's API.

import { beforeEach, describe, expect, it } from "vitest";
import { liquid, render } from "@";

describe("placeholder_svg_tag filter", () => {
	let container: HTMLElement;
	beforeEach(async () => {
		container = await render(liquid`
{{ 'collection-1' | placeholder_svg_tag }}
{{ 'collection-1' | placeholder_svg_tag: 'custom-class' }}
		`);
	});

	it("returns an `<svg>` carrying the placeholder name", () => {
		const svg = container.querySelectorAll("svg")[0];
		expect(svg.getAttribute("data-placeholder")).toBe("collection-1");
		expect(svg.getAttribute("aria-label")).toBe("collection-1");
		expect(svg.getAttribute("xmlns")).toBe("http://www.w3.org/2000/svg");
	});

	it("applies the optional positional `class` argument", () => {
		const svg = container.querySelectorAll("svg")[1];
		expect(svg.getAttribute("class")).toBe("custom-class");
	});
});
