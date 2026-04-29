// Shopify reference: https://shopify.dev/docs/api/liquid/filters/video_tag
// Real Shopify generates a fully-formed `<video>` from a media object with
// CDN-hosted sources and a poster image. The Assay shim emits a `<video>`
// with default playback attributes plus a single `<source>` derived from
// `media.src`, and forwards keyword arguments (autoplay, loop, muted,
// controls, etc.) as attributes on the outer element.

import { beforeEach, describe, expect, it } from "vitest";
import { liquid, render } from "@";

describe("video_tag filter", () => {
	let container: HTMLElement;
	beforeEach(async () => {
		container = await render(
			liquid`
{{ media | video_tag }}
{{ media | video_tag: autoplay: true, loop: true, muted: true, controls: true }}
		`,
			{
				media: {
					media_type: "video",
					src: "/tests/fixtures/videos/promo.mp4",
					preview_image: "/tests/fixtures/videos/promo.jpg",
				},
			},
		);
	});

	it("emits a `<video>` with default playback attributes", () => {
		const video = container.querySelectorAll("video")[0];
		expect(video.getAttribute("playsinline")).toBe("playsinline");
		expect(video.getAttribute("preload")).toBe("metadata");
		expect(video.getAttribute("poster")).toBe(
			"/tests/fixtures/videos/promo.jpg",
		);
	});

	it("includes a `<source>` derived from `media.src`", () => {
		const source = container
			.querySelectorAll("video")[0]
			.querySelector("source");
		expect(source?.getAttribute("src")).toBe(
			"/tests/fixtures/videos/promo.mp4",
		);
		expect(source?.getAttribute("type")).toBe("video/mp4");
	});

	it("forwards boolean HTML5 attributes when supplied", () => {
		const video = container.querySelectorAll("video")[1];
		expect(video.hasAttribute("autoplay")).toBe(true);
		expect(video.hasAttribute("loop")).toBe(true);
		expect(video.hasAttribute("muted")).toBe(true);
		expect(video.hasAttribute("controls")).toBe(true);
	});
});
