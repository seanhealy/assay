import { beforeEach, describe, expect, it } from "vitest";
import { liquid, render } from "@";

describe("stylesheet_tag()", () => {
	let container: HTMLElement;

	describe("with the Shopify docs example", () => {
		beforeEach(async () => {
			container = await render(
				liquid`{{ 'base.css' | asset_url | stylesheet_tag }}`,
			);
		});

		it("sets `rel` to `stylesheet`", () => {
			expect(container.querySelector("link")?.getAttribute("rel")).toBe(
				"stylesheet",
			);
		});

		it("sets `type` to `text/css`", () => {
			expect(container.querySelector("link")?.getAttribute("type")).toBe(
				"text/css",
			);
		});

		it("defaults `media` to `all`", () => {
			expect(container.querySelector("link")?.getAttribute("media")).toBe(
				"all",
			);
		});

		it("uses the upstream URL as `href`", () => {
			expect(container.querySelector("link")?.getAttribute("href")).toBe(
				"/tests/fixtures/assets/base.css",
			);
		});
	});

	describe("with a positional `media` argument", () => {
		beforeEach(async () => {
			container = await render(
				liquid`{{ 'print.css' | asset_url | stylesheet_tag: 'print' }}`,
			);
		});

		it("uses the supplied value for `media`", () => {
			expect(container.querySelector("link")?.getAttribute("media")).toBe(
				"print",
			);
		});
	});

	describe("with a keyword argument", () => {
		beforeEach(async () => {
			container = await render(
				liquid`{{ 'preload.css' | asset_url | stylesheet_tag: preload: true }}`,
			);
		});

		it("forwards the keyword as a boolean attribute", () => {
			expect(container.querySelector("link")?.hasAttribute("preload")).toBe(
				true,
			);
		});
	});
});
