// `video_tag` is a mock — real Shopify resolves `media.sources[].url` and
// `media.preview_image.src` to CDN paths, the shim just passes them through
// unchanged. Tests here use the same `video` object shape that themes get
// from `product.media`: an array of sources, a preview_image object, and an
// alt string.

import { beforeEach, describe, expect, it } from "vitest";
import { liquid, render } from "@";

const media = {
	media_type: "video",
	alt: "Potion beats",
	sources: [
		{ url: "/tests/fixtures/videos/promo.mp4", mime_type: "video/mp4" },
		{ url: "/tests/fixtures/videos/promo.webm", mime_type: "video/webm" },
	],
	preview_image: { src: "/tests/fixtures/videos/promo.jpg" },
};

describe("video_tag()", () => {
	let container: HTMLElement;

	describe("with default arguments", () => {
		beforeEach(async () => {
			container = await render(liquid`{{ media | video_tag }}`, { media });
		});

		it("sets `playsinline`", () => {
			expect(
				container.querySelector("video")?.getAttribute("playsinline"),
			).toBe("playsinline");
		});

		it("sets `preload` to `metadata`", () => {
			expect(container.querySelector("video")?.getAttribute("preload")).toBe(
				"metadata",
			);
		});

		it("derives `aria-label` from `media.alt`", () => {
			expect(container.querySelector("video")?.getAttribute("aria-label")).toBe(
				media.alt,
			);
		});

		it("derives `poster` from `media.preview_image.src`", () => {
			expect(container.querySelector("video")?.getAttribute("poster")).toBe(
				media.preview_image.src,
			);
		});

		it("emits one `<source>` per entry in `media.sources`", () => {
			expect(container.querySelectorAll("video source").length).toBe(2);
		});

		it("uses `source.url` for the `src` attribute", () => {
			const sources = container.querySelectorAll("video source");
			expect(sources[0].getAttribute("src")).toBe(media.sources[0].url);
			expect(sources[1].getAttribute("src")).toBe(media.sources[1].url);
		});

		it("uses `source.mime_type` for the `type` attribute", () => {
			const sources = container.querySelectorAll("video source");
			expect(sources[0].getAttribute("type")).toBe(media.sources[0].mime_type);
			expect(sources[1].getAttribute("type")).toBe(media.sources[1].mime_type);
		});

		it("emits a fallback `<img>` with the preview image src", () => {
			expect(container.querySelector("video img")?.getAttribute("src")).toBe(
				media.preview_image.src,
			);
		});
	});

	describe("with HTML5 boolean attributes", () => {
		beforeEach(async () => {
			container = await render(
				liquid`{{ media | video_tag: autoplay: true, loop: true, muted: true, controls: true }}`,
				{ media },
			);
		});

		it("forwards `autoplay`", () => {
			expect(container.querySelector("video")?.hasAttribute("autoplay")).toBe(
				true,
			);
		});

		it("forwards `loop`", () => {
			expect(container.querySelector("video")?.hasAttribute("loop")).toBe(true);
		});

		it("forwards `muted`", () => {
			expect(container.querySelector("video")?.hasAttribute("muted")).toBe(
				true,
			);
		});

		it("forwards `controls`", () => {
			expect(container.querySelector("video")?.hasAttribute("controls")).toBe(
				true,
			);
		});
	});
});
