import { renderSnippet } from "@augeo/assay";
import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";

describe("hero.liquid", () => {
	describe("with just a heading", () => {
		beforeEach(() =>
			renderSnippet("hero", {
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
			renderSnippet("hero", {
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
			renderSnippet("hero", {
				section: {
					settings: {
						heading: "Welcome",
						cta: "Shop now",
					},
				},
			}),
		);

		it("renders the button from the nested snippet", async () => {
			await expect
				.element(page.getByRole("button", { name: "Shop now" }))
				.toBeVisible();
		});
	});
});
