import { createReadStream } from 'node:fs';
import { type Asset, fs, URL, VirtualAssets } from 'ezal';
import Sharp from 'sharp';
import { getOptimizedPath } from './utils';

const OPTIMIZE = {
	'.avif': (sharp) => sharp.avif().toBuffer(),
	'.webp': (sharp) => sharp.webp().toBuffer(),
	'.jxl': (sharp) => sharp.jxl().toBuffer(),
	'.jpg': (sharp) =>
		sharp
			.jpeg({
				trellisQuantisation: true,
				overshootDeringing: true,
				progressive: true,
				optimiseScans: true,
			})
			.toBuffer(),
	'.png': (sharp) =>
		sharp.png({ progressive: true, adaptiveFiltering: true }).toBuffer(),
	'.gif': (sharp) => sharp.gif().toBuffer(),
} as const satisfies Record<string, (sharp: Sharp.Sharp) => Promise<Buffer>>;

export type OptimizedImageExt = keyof typeof OPTIMIZE;

export class OptimizedImage extends VirtualAssets {
	#optimizedPath: string;
	#filepath: string;
	#ext: OptimizedImageExt;
	/**
	 * @param asset 源资源
	 * @param target 目标优化格式
	 */
	constructor(asset: Asset, ext: OptimizedImageExt) {
		super(URL.extname(asset.url, `.opt${ext}`));
		this.#filepath = asset.filepath;
		this.#ext = ext;
		this.#optimizedPath = getOptimizedPath(this.#filepath, ext);
	}
	async build() {
		if (await fs.isFile(this.#optimizedPath)) {
			return createReadStream(this.#optimizedPath);
		}
		const sharp = Sharp(this.#filepath);
		const buffer = await OPTIMIZE[this.#ext](sharp);
		fs.writeFile(this.#optimizedPath, buffer);
		return buffer;
	}
	protected onDependenciesChanged() {}
}
