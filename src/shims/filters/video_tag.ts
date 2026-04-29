import { attributes, keywordArgs } from "../shared/html";
import type { ShimFilter } from "../types";

export default {
	type: "filter",
	name: "video_tag",
	status: "mock",
	implementation: (value, ...args) => {
		const media = (value ?? {}) as Record<string, unknown>;
		const src =
			typeof media.src === "string"
				? media.src
				: typeof media === "string"
					? media
					: "";
		const poster =
			typeof media.preview_image === "string" ? media.preview_image : undefined;
		const { image_size: _imageSize, ...rest } = keywordArgs(args);
		return `<video${attributes({
			playsinline: "playsinline",
			preload: "metadata",
			poster,
			...rest,
		})}><source${attributes({ src, type: "video/mp4" })}></video>`;
	},
} satisfies ShimFilter;
