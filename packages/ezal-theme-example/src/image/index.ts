import path from 'node:path/posix';
import { type Asset, fs, Logger } from 'ezal';
import { OptimizedImage, type OptimizedImageExt } from './asset';
import { type ImageMetadata, imageDB } from './db';
import { updateImageMetadata } from './metadata';
import { getOptimizedPath } from './utils';

export interface ImageInfo {
	metadata: ImageMetadata | null;
	rule?: string[];
}

const INFO = {
	ADD: 'Add image file:',
	UPDATE: 'Update image file:',
	REMOVE: 'Remove image file:',
	OPTIMIZE: (path: string) =>
		`The image "${path}" will be generated in this format:`,
} as const;
const ERR = {
	METADATA: (path: string) => `Unable to update metadata for "${path}"`,
} as const;

const SUPPORT_EXTS = new Set<string>([
	'.jpeg',
	'.jpg',
	'.png',
	'.gif',
	'.webp',
	'.svg',
	'.tiff',
	'.tif',
	'.avif',
	'.heif',
	'.jxl',
]);

const OPTIMIZE_RULES = new Map<string, OptimizedImageExt[]>([
	['.jpeg', ['.avif', '.webp', '.jxl', '.jpg']],
	['.jpg', ['.avif', '.webp', '.jpg']],
	['.png', ['.avif', '.webp', '.png']],
	['.webp', ['.avif', '.webp', '.png']],
	['.avif', ['.avif', '.webp', '.png']],
]);

const logger = new Logger('theme:image');

const assetsMap = new Map<string, OptimizedImage[]>();

export function getImageInfo(url: string): ImageInfo | null {
	const ext = path.extname(url).toLowerCase();
	if (!SUPPORT_EXTS.has(ext)) return null;
	const metadata = imageDB.get(url);
	const rule = OPTIMIZE_RULES.get(ext);
	return { metadata, rule };
}

async function cleanOptimized(asset: Asset) {
	const ext = path.extname(asset.filepath).toLowerCase();
	const rule = OPTIMIZE_RULES.get(ext);
	if (!rule) return;
	await Promise.all(
		rule
			.map((ext) => getOptimizedPath(asset.filepath, ext))
			.map((filepath) => fs.remove(filepath)),
	);
}

export async function imageAddHook(asset: Asset) {
	if (asset.level !== 'user') return;
	const ext = path.extname(asset.filepath).toLowerCase();
	if (!SUPPORT_EXTS.has(ext)) return;
	logger.debug(INFO.ADD, asset.filepath);
	let updated = false;
	// Metadata
	try {
		updated = await updateImageMetadata(asset);
	} catch (error) {
		logger.error(ERR.METADATA(asset.filepath), error);
	}
	// Asset
	if (updated) await cleanOptimized(asset);
	const rule = OPTIMIZE_RULES.get(ext);
	if (!rule) return;
	logger.debug(INFO.OPTIMIZE(asset.filepath), rule);
	const assets = rule
		.map<OptimizedImage | null>((ext) => {
			try {
				return new OptimizedImage(asset, ext);
			} catch (error) {
				logger.warn(error);
				return null;
			}
		})
		.filter((v) => v) as OptimizedImage[];
	assetsMap.set(asset.url, assets);
}

export async function imageUpdateHook(asset: Asset) {
	if (asset.level !== 'user') return;
	const ext = path.extname(asset.filepath).toLowerCase();
	if (!SUPPORT_EXTS.has(ext)) return;
	logger.debug(INFO.UPDATE, asset.filepath);
	let updated = false;
	// Metadata
	try {
		updated = await updateImageMetadata(asset);
	} catch (error) {
		logger.error(ERR.METADATA(asset.filepath), error);
	}
	// Asset
	if (updated) await cleanOptimized(asset);
	const assets = assetsMap.get(asset.url);
	if (!assets) return;
	for (const asset of assets) {
		asset.invalidated();
	}
}

export function imageRemoveHook(asset: Asset) {
	if (asset.level !== 'user') return;
	const ext = path.extname(asset.filepath).toLowerCase();
	if (!SUPPORT_EXTS.has(ext)) return;
	logger.debug(INFO.REMOVE, asset.filepath);
	imageDB.delete(asset.filepath);
	const assets = assetsMap.get(asset.url);
	if (!assets) return;
	assetsMap.delete(asset.url);
	for (const asset of assets) {
		asset.destroy();
	}
}
