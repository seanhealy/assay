// Shopify reference: https://shopify.dev/docs/api/liquid/filters/image_tag
// Real Shopify wraps an `image_url` in an `<img>` with computed `srcset`,
// `width`, `height`, and an inferred `alt`. The Assay shim emits an `<img>`
// with the upstream URL as `src`, defaults `alt=""` and `srcset` to the same
// URL, and forwards any keyword args (class, loading, sizes, etc.) as
// attributes. `srcset: nil` removes the attribute entirely.

import { beforeEach, describe, expect, it } from "vitest";
import { liquid, render } from "@";

describe("image_tag()", () => {
	let container: HTMLElement;

	describe("without keyword arguments", () => {
		beforeEach(async () => {
			container = await render(
				liquid`{{ product | image_url: width: 200 | image_tag }}`,
				{ product: { title: "Potion" } },
			);
		});

		it("emits an `<img>` with the upstream URL as `src`", () => {
			expect(container.querySelector("img")?.getAttribute("src")).toContain(
				"width=200",
			);
		});

		it("defaults `alt` to an empty string", () => {
			expect(container.querySelector("img")?.getAttribute("alt")).toBe("");
		});

		it("defaults `srcset` to the same URL as `src`", () => {
			const img = container.querySelector("img");
			expect(img?.getAttribute("srcset")).toBe(img?.getAttribute("src"));
		});
	});

	describe("with an explicit alt", () => {
		beforeEach(async () => {
			container = await render(
				liquid`{{ product | image_url | image_tag: alt: "My image's alt text" }}`,
				{ product: { title: "Potion" } },
			);
		});

		it("uses the supplied alt text", () => {
			expect(container.querySelector("img")?.getAttribute("alt")).toBe(
				"My image's alt text",
			);
		});
	});

	describe("with an explicit srcset string", () => {
		beforeEach(async () => {
			container = await render(
				liquid`{{ product | image_url | image_tag: srcset: '/cdn/200.png 200w, /cdn/400.png 400w' }}`,
				{ product: { title: "Potion" } },
			);
		});

		it("uses the supplied srcset verbatim", () => {
			expect(container.querySelector("img")?.getAttribute("srcset")).toBe(
				"/cdn/200.png 200w, /cdn/400.png 400w",
			);
		});
	});

	describe("with `srcset: nil`", () => {
		beforeEach(async () => {
			container = await render(
				liquid`{{ product | image_url | image_tag: srcset: nil }}`,
				{ product: { title: "Potion" } },
			);
		});

		it("removes the srcset attribute", () => {
			expect(container.querySelector("img")?.hasAttribute("srcset")).toBe(
				false,
			);
		});
	});

	describe("with arbitrary keyword arguments", () => {
		beforeEach(async () => {
			container = await render(
				liquid`{{ product | image_url | image_tag: class: 'custom-class', loading: 'lazy' }}`,
				{ product: { title: "Potion" } },
			);
		});

		it("forwards `class` as an attribute", () => {
			expect(container.querySelector("img")?.getAttribute("class")).toBe(
				"custom-class",
			);
		});

		it("forwards `loading` as an attribute", () => {
			expect(container.querySelector("img")?.getAttribute("loading")).toBe(
				"lazy",
			);
		});
	});
});
