import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { render } from "@";

describe("inline_asset_content filter", () => {
	beforeEach(() => render("filter-inline_asset_content"));

	it("inlines the SVG asset content", async () => {
		await expect.element(page.getByTestId("icon")).toBeVisible();
		await expect.element(page.getByTestId("icon")).toContainHTML("<svg");
	});
});
