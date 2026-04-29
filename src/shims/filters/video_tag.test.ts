// Shopify reference: https://shopify.dev/docs/api/liquid/filters/video_tag
// Real Shopify generates a fully-formed `<video>` from a media object with
// CDN-hosted sources and a poster image. The Assay shim emits a `<video>`
// with default playback attributes plus a single `<source>` derived from
// `media.src`, and forwards keyword arguments (autoplay, loop, muted,
// controls, etc.) as attributes on the outer element.

import { beforeEach, describe, expect, it } from "vitest";
import { liquid, render } from "@";

describe("video_tag()", () => {
	let container: HTMLElement;
	const media = {
		media_type: "video",
		src: "/tests/fixtures/videos/promo.mp4",
		preview_image: "/tests/fixtures/videos/promo.jpg",
	};

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

		it("derives `poster` from `media.preview_image`", () => {
			expect(container.querySelector("video")?.getAttribute("poster")).toBe(
				media.preview_image,
			);
		});

		it("emits a `<source>` whose `src` is `media.src`", () => {
			expect(container.querySelector("video source")?.getAttribute("src")).toBe(
				media.src,
			);
		});

		it("emits a `<source>` whose `type` is `video/mp4`", () => {
			expect(
				container.querySelector("video source")?.getAttribute("type"),
			).toBe("video/mp4");
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
