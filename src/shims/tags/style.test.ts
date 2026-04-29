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

	it("emits a `<style>` element", () => {
		expect(container.querySelector("style")).not.toBeNull();
	});

	it("annotates the element with `data-shopify`", () => {
		expect(container.querySelector("style")?.hasAttribute("data-shopify")).toBe(
			true,
		);
	});

	it("interpolates Liquid expressions inside the body", () => {
		expect(container.querySelector("style")?.textContent).toContain(
			"color: #121212",
		);
	});
});
