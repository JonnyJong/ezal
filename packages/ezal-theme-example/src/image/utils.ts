import path from 'node:path';
import { getThemeConfig } from '../config';

let dir: string | undefined;
function getCacheDir(): string {
	if (dir) return dir;
	dir = getThemeConfig().imageCache?.optimized ?? 'cache';
	if (!path.isAbsolute(dir)) dir = path.resolve(dir);
	return dir;
}

export function getOptimizedPath(filepath: string, ext: string): string {
	const dir = getCacheDir();
	const cachePath = path.relative(process.cwd(), filepath);
	return `${path.join(dir, cachePath)}.opt${ext}`;
}
