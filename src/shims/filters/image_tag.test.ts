// Shopify reference: https://shopify.dev/docs/api/liquid/filters/image_tag
// Real Shopify wraps an `image_url` in an `<img>` with computed `srcset`,
// `width`, `height`, and an inferred `alt`. The Assay shim emits an `<img>`
// with the upstream URL as `src`, defaults `alt=""` and `srcset` to the same
// URL, and forwards any keyword args (class, loading, sizes, etc.) as
// attributes. `srcset: nil` removes the attribute.

import { beforeEach, describe, expect, it } from "vitest";
import { liquid, render } from "@";

describe("image_tag filter", () => {
	let container: HTMLElement;
	beforeEach(async () => {
		container = await render(
			liquid`
{{ product | image_url: width: 200 | image_tag }}
{{ product | image_url: width: 200 | image_tag: alt: "My image's alt text" }}
{{ product | image_url: width: 200 | image_tag: srcset: nil }}
{{ product | image_url: width: 200 | image_tag: class: 'custom-class', loading: 'lazy' }}
		`,
			{ product: { title: "Potion" } },
		);
	});

	it("emits an `<img>` with the upstream URL as `src`", () => {
		const img = container.querySelectorAll("img")[0];
		expect(img.getAttribute("src")).toContain("data:image/png;base64");
		expect(img.getAttribute("src")).toContain("width=200");
	});

	it("defaults `alt` to an empty string and uses `src` for `srcset`", () => {
		const img = container.querySelectorAll("img")[0];
		expect(img.getAttribute("alt")).toBe("");
		expect(img.getAttribute("srcset")).toBe(img.getAttribute("src"));
	});

	it("uses an explicit `alt` when supplied", () => {
		const img = container.querySelectorAll("img")[1];
		expect(img.getAttribute("alt")).toBe("My image's alt text");
	});

	it("removes `srcset` when set to nil", () => {
		const img = container.querySelectorAll("img")[2];
		expect(img.hasAttribute("srcset")).toBe(false);
	});

	it("forwards arbitrary keyword args as attributes", () => {
		const img = container.querySelectorAll("img")[3];
		expect(img.getAttribute("class")).toBe("custom-class");
		expect(img.getAttribute("loading")).toBe("lazy");
	});
});
