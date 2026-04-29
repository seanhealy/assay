import { attributes, keywordArgs } from "../shared/html";
import type { ShimFilter } from "../types";

export default {
	type: "filter",
	name: "video_tag",
	status: "mock",
	implementation: (value, ...args) => {
		const media = (value ?? {}) as {
			sources?: Array<{ url?: unknown; mime_type?: unknown }>;
			preview_image?: { src?: unknown };
			alt?: unknown;
		};
		const sources = Array.isArray(media.sources) ? media.sources : [];
		const poster =
			typeof media.preview_image?.src === "string"
				? media.preview_image.src
				: undefined;
		const ariaLabel = typeof media.alt === "string" ? media.alt : undefined;
		const { image_size: _imageSize, ...rest } = keywordArgs(args);

		const sourceTags = sources
			.map(
				(source) =>
					`<source${attributes({
						src: typeof source.url === "string" ? source.url : undefined,
						type:
							typeof source.mime_type === "string"
								? source.mime_type
								: "video/mp4",
					})}>`,
			)
			.join("");
		const fallbackImage = poster ? `<img${attributes({ src: poster })}>` : "";

		return `<video${attributes({
			playsinline: "playsinline",
			...rest,
			preload: rest.preload ?? "metadata",
			"aria-label": ariaLabel,
			poster,
		})}>${sourceTags}${fallbackImage}</video>`;
	},
} satisfies ShimFilter;
