import path from 'node:path';
import { getConfig } from '../config';
import type { AssetLevel } from '../types';

export function resolveSrc(src: string, level: AssetLevel) {
	const { source, theme } = getConfig();
	const root = level === 'user' ? source.root : theme.assetsRoot;
	return path.join(root, src);
}

export function createMap<T>(): Record<AssetLevel, Map<string, T>> {
	return { user: new Map(), theme: new Map(), virtual: new Map() };
}
