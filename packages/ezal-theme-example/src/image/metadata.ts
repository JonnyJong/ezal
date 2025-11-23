import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import type { Asset } from 'ezal';
import { Vibrant } from 'node-vibrant/node';
import Sharp from 'sharp';
import { type ImageMetadata, imageDB } from './db';

export async function updateImageMetadata(asset: Asset): Promise<boolean> {
	const buffer = await readFile(asset.filepath);
	// Hash
	const hash = createHash('sha256').update(buffer).digest('hex');
	// Check
	if (imageDB.get(asset.url)?.hash === hash) return false;
	// Size
	const sharp = Sharp(buffer);
	const { width, height, format } = await sharp.metadata();
	// Color
	let color: string | null = null;
	if (format !== 'svg') {
		try {
			const palette = await Vibrant.from(buffer).getPalette();
			color = palette.Muted?.hex ?? null;
		} catch {}
	}
	// Update
	const metadata: ImageMetadata = {
		path: asset.url,
		hash,
		width,
		height,
		color,
	};
	imageDB.update(metadata);
	return true;
}
