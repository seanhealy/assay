import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { mock, render } from "../src/index";

mock("greeting", "<span data-testid='mock-greeting'>{{ name }}</span>");

describe("mock at module level", () => {
	beforeEach(() =>
		render("page", {
			section: { settings: { title: "Welcome", name: "Echo" } },
		}),
	);

	it("renders the mock instead of the real snippet", async () => {
		await expect.element(page.getByTestId("mock-greeting")).toBeVisible();
	});

	it("passes variables to the mock template", async () => {
		await expect.element(page.getByText("Echo")).toBeVisible();
	});
});
