import { attributes, keywordArgs } from "../shared/html";
import type { ShimFilter } from "../types";

interface VideoSource {
	url?: unknown;
	mime_type?: unknown;
}

interface PreviewImage {
	src?: unknown;
}

interface Video {
	sources?: unknown;
	preview_image?: unknown;
	alt?: unknown;
}

export default {
	type: "filter",
	name: "video_tag",
	status: "mock",
	implementation: (value, ...args) => {
		const media = (value ?? {}) as Video;
		const sources = Array.isArray(media.sources)
			? (media.sources as VideoSource[])
			: [];
		const previewImage =
			typeof media.preview_image === "object" && media.preview_image !== null
				? (media.preview_image as PreviewImage)
				: undefined;
		const poster =
			typeof previewImage?.src === "string" ? previewImage.src : undefined;
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
