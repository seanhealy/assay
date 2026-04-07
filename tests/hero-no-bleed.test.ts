import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "../src/index";

describe("mock does not bleed between files", () => {
	beforeEach(() =>
		render("page", {
			section: { settings: { title: "Welcome", name: "Echo" } },
		}),
	);

	it("renders the real greeting snippet", async () => {
		await expect.element(page.getByText("Hello, Echo!")).toBeVisible();
	});

	it("does not render the mock", async () => {
		await expect
			.element(page.getByTestId("mock-greeting"))
			.not.toBeInTheDocument();
	});
});
