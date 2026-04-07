import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { mock, render, unmock } from "../src/index";

describe("mock in beforeEach", () => {
	describe("with a mocked greeting", () => {
		beforeEach(() =>
			mock("greeting", "<span data-testid='mock-greeting'>{{ name }}</span>"),
		);
		afterEach(() => unmock("greeting"));

		beforeEach(() =>
			render("page", {
				section: { settings: { title: "Welcome", name: "Echo" } },
			}),
		);

		it("renders the mock", async () => {
			await expect.element(page.getByTestId("mock-greeting")).toBeVisible();
		});

		it("passes variables to the mock", async () => {
			await expect.element(page.getByText("Echo")).toBeVisible();
		});
	});

	describe("without the mock (after unmock)", () => {
		beforeEach(() =>
			render("page", {
				section: { settings: { title: "Welcome", name: "Echo" } },
			}),
		);

		it("renders the real greeting", async () => {
			await expect.element(page.getByText("Hello, Echo!")).toBeVisible();
		});

		it("does not render the mock", async () => {
			await expect
				.element(page.getByTestId("mock-greeting"))
				.not.toBeInTheDocument();
		});
	});
});
