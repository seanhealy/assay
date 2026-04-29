// Shopify reference: https://shopify.dev/docs/api/liquid/filters/translate
// Real Shopify resolves the key against the active locale file. The Assay
// shim has no locale data so it returns the key itself (or an empty string
// for nil). `t` and `translate` are aliases — both registered to the same
// implementation.

import { beforeEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";
import { liquid, render } from "@";

describe("t / translate filters", () => {
	beforeEach(() =>
		render(
			liquid`
<div data-testid="t-key">{{ "general.greeting" | t }}</div>
<div data-testid="translate-key">{{ "general.greeting" | translate }}</div>
<div data-testid="t-with-data">{{ greeting | t }}</div>
		`,
			{ greeting: "Hello, Echo" },
		),
	);

	it("returns the key unchanged via `t`", async () => {
		await expect
			.element(page.getByTestId("t-key"))
			.toHaveTextContent("general.greeting");
	});

	it("returns the key unchanged via `translate`", async () => {
		await expect
			.element(page.getByTestId("translate-key"))
			.toHaveTextContent("general.greeting");
	});

	it("passes a non-key value through unchanged", async () => {
		await expect
			.element(page.getByTestId("t-with-data"))
			.toHaveTextContent("Hello, Echo");
	});
});
