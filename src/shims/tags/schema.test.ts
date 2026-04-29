// Shopify reference: https://shopify.dev/docs/api/liquid/tags/schema
// `{% schema %}` blocks declare section/block settings as JSON. Shopify
// strips them at compile time so they never render. The Assay shim is a
// no-op block tag — it consumes the contents and emits nothing.

import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { liquid, render } from "@";

describe("schema tag", () => {
	let container: HTMLElement;
	beforeEach(async () => {
		container = await render(liquid`
<div data-testid="before">before</div>
{% schema %}
{
	"name": "Test section",
	"settings": [
		{ "id": "title", "type": "text", "label": "Title" }
	]
}
{% endschema %}
<div data-testid="after">after</div>
		`);
	});

	it("renders content before and after the schema block", async () => {
		await expect
			.element(page.getByTestId("before"))
			.toHaveTextContent("before");
		await expect.element(page.getByTestId("after")).toHaveTextContent("after");
	});

	it("emits nothing for the schema block contents", () => {
		expect(container.textContent).not.toContain("Test section");
		expect(container.textContent).not.toContain("settings");
	});
});
