// Shopify reference: https://shopify.dev/docs/api/liquid/filters/stylesheet_tag
// `stylesheet_tag` wraps a URL in a `<link rel="stylesheet">` tag with
// `type="text/css"` and `media="all"` by default. The Assay shim uses the
// upstream URL as-is (it's typically the output of `asset_url`) and passes
// keyword arguments through as additional attributes.

import { beforeEach, describe, expect, it } from "vitest";
import { liquid, render } from "@";

describe("stylesheet_tag filter", () => {
	let container: HTMLElement;
	beforeEach(async () => {
		container = await render(liquid`
{{ 'base.css' | asset_url | stylesheet_tag }}
{{ 'print.css' | asset_url | stylesheet_tag: 'print' }}
{{ 'preload.css' | asset_url | stylesheet_tag: preload: true }}
		`);
	});

	it("emits a `<link>` tag with stylesheet defaults", () => {
		const link = container.querySelectorAll("link")[0];
		expect(link.getAttribute("rel")).toBe("stylesheet");
		expect(link.getAttribute("type")).toBe("text/css");
		expect(link.getAttribute("media")).toBe("all");
		expect(link.getAttribute("href")).toBe("/tests/fixtures/assets/base.css");
	});

	it("uses a positional `media` argument when supplied", () => {
		const link = container.querySelectorAll("link")[1];
		expect(link.getAttribute("media")).toBe("print");
	});

	it("forwards keyword arguments as additional attributes", () => {
		const link = container.querySelectorAll("link")[2];
		expect(link.hasAttribute("preload")).toBe(true);
	});
});
