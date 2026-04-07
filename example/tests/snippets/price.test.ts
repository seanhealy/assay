import { render } from "@augeo/assay";
import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";

describe("price.liquid", () => {
	describe("with a price in cents", () => {
		beforeEach(() => render("price", { price: 2999 }));

		it("formats cents to dollars", async () => {
			await expect.element(page.getByText("$29.99")).toBeVisible();
		});
	});

	describe("with zero", () => {
		beforeEach(() => render("price", { price: 0 }));

		it("formats as $0.00", async () => {
			await expect.element(page.getByText("$0.00")).toBeVisible();
		});
	});
});
