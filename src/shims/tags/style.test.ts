// Shopify reference: https://shopify.dev/docs/api/liquid/tags/style
// `{% style %}` wraps its body in a `<style data-shopify>` tag. The body is
// regular Liquid: variables interpolate before being emitted as CSS. The
// `data-shopify` attribute is preserved so themes that key off it behave the
// same way as in production.

import { beforeEach, describe, expect, it } from "vitest";
import { liquid, render } from "@";

describe("style tag", () => {
	let container: HTMLElement;
	beforeEach(async () => {
		container = await render(
			liquid`{% style %}
  .h1 {
    color: {{ settings.colors_accent_1 }};
  }
{% endstyle %}`,
			{ settings: { colors_accent_1: "#121212" } },
		);
	});

	it("emits a `<style data-shopify>` element", () => {
		const style = container.querySelector("style");
		expect(style).not.toBeNull();
		expect(style?.hasAttribute("data-shopify")).toBe(true);
	});

	it("interpolates Liquid expressions inside the body", () => {
		const css = container.querySelector("style")?.textContent ?? "";
		expect(css).toContain(".h1");
		expect(css).toContain("color: #121212");
	});
});
