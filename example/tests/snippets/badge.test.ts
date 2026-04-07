import { render } from "@augeo/assay";
import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";

describe("badge.liquid", () => {
	describe("with the upcase_first filter", () => {
		beforeEach(() => render("badge", { label: "new" }));

		it("capitalises the first letter", async () => {
			await expect.element(page.getByText("New")).toBeVisible();
		});
	});
});
