import { render } from "@augeo/assay";
import { beforeEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

describe("toggle-switch.liquid", () => {
	describe("when unchecked", () => {
		beforeEach(() =>
			render(
				"toggle-switch",
				{ name: "notifications", label: "Enable notifications" },
				{ waitForElements: ["toggle-switch"] },
			),
		);

		it("renders an unchecked checkbox", async () => {
			await expect
				.element(page.getByRole("checkbox", { name: "Enable notifications" }))
				.not.toBeChecked();
		});

		it("checks the checkbox when clicked", async () => {
			await userEvent.click(page.getByText("Enable notifications"));

			await expect
				.element(page.getByRole("checkbox", { name: "Enable notifications" }))
				.toBeChecked();
		});
	});

	describe("when checked", () => {
		beforeEach(() =>
			render(
				"toggle-switch",
				{
					name: "notifications",
					label: "Enable notifications",
					checked: true,
				},
				{ waitForElements: ["toggle-switch"] },
			),
		);

		it("renders a checked checkbox", async () => {
			await expect
				.element(page.getByRole("checkbox", { name: "Enable notifications" }))
				.toBeChecked();
		});

		it("unchecks the checkbox when clicked", async () => {
			await userEvent.click(page.getByText("Enable notifications"));

			await expect
				.element(page.getByRole("checkbox", { name: "Enable notifications" }))
				.not.toBeChecked();
		});
	});
});
