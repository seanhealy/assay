import { mock, render } from "@augeo/assay";
import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";

mock("button", "<span data-testid='mock-button'>{{ text }}</span>");

describe("hero.liquid", () => {
	describe("with just a heading", () => {
		beforeEach(() =>
			render("hero", {
				section: { settings: { heading: "Welcome" } },
			}),
		);

		it("renders the heading", async () => {
			await expect
				.element(page.getByRole("heading", { name: "Welcome" }))
				.toBeVisible();
		});

		it("omits the subheading", async () => {
			await expect
				.element(page.getByText("Shop our latest collection"))
				.not.toBeInTheDocument();
		});
	});

	describe("with a subheading", () => {
		beforeEach(() =>
			render("hero", {
				section: {
					settings: {
						heading: "Welcome",
						subheading: "Shop our latest collection",
					},
				},
			}),
		);

		it("renders the heading", async () => {
			await expect
				.element(page.getByRole("heading", { name: "Welcome" }))
				.toBeVisible();
		});

		it("renders the subheading", async () => {
			await expect
				.element(page.getByText("Shop our latest collection"))
				.toBeVisible();
		});
	});

	describe("with a call to action", () => {
		beforeEach(() =>
			render("hero", {
				section: {
					settings: {
						heading: "Welcome",
						cta: "Shop now",
					},
				},
			}),
		);

		it("renders the mocked button", async () => {
			await expect.element(page.getByTestId("mock-button")).toBeVisible();
		});

		it("passes variables to the mock", async () => {
			await expect.element(page.getByText("Shop now")).toBeVisible();
		});
	});
});
