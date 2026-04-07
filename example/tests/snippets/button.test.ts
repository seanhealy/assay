import { render } from "@augeo/assay";
import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";

describe("button.liquid", () => {
	describe("with default variant", () => {
		beforeEach(() => render("button", { text: "Click me" }));

		it("renders a button", async () => {
			await expect
				.element(page.getByRole("button", { name: "Click me" }))
				.toBeVisible();
		});
	});

	describe("with a variant", () => {
		beforeEach(() => render("button", { text: "Buy", variant: "secondary" }));

		it("renders a button", async () => {
			await expect
				.element(page.getByRole("button", { name: "Buy" }))
				.toBeVisible();
		});
	});

	describe("when disabled", () => {
		beforeEach(() => render("button", { text: "Sold out", disabled: true }));

		it("renders a disabled button", async () => {
			await expect
				.element(page.getByRole("button", { name: "Sold out" }))
				.toBeDisabled();
		});
	});
});
