import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { liquid, render } from "@";

describe("doc tag", () => {
	let container: HTMLElement;

	beforeEach(async () => {
		container = await render(liquid`
<div data-testid="before">before</div>
{% doc %}
	@description Renders a button with the given text.
	@param {string} text - The button label.
{% enddoc %}
<div data-testid="after">after</div>
		`);
	});

	describe("surrounding content", () => {
		it("renders content before the doc block", async () => {
			await expect
				.element(page.getByTestId("before"))
				.toHaveTextContent("before");
		});

		it("renders content after the doc block", async () => {
			await expect
				.element(page.getByTestId("after"))
				.toHaveTextContent("after");
		});
	});

	describe("the doc block contents", () => {
		it("emits nothing for the @description annotation", () => {
			expect(container.textContent).not.toContain("@description");
		});

		it("emits nothing for the @param annotation", () => {
			expect(container.textContent).not.toContain("@param");
		});
	});
});
