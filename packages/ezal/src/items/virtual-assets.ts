import { getMode } from '../config';
import { Logger } from '../logger';
import { Route, type RouteContent } from '../route';
import { broadcastUpdate } from '../server';
import type { PromiseOr } from '../types';
import { Cache, teeToCache } from '../utils/cache';

const logger = new Logger('virtual-assets');

const assets = new Set<VirtualAssets>();

/**
 * 虚拟资源
 * @description
 * 自带缓存，优先级高于用户和主题资源
 */
export abstract class VirtualAssets extends Route {
	static getAll(): VirtualAssets[] {
		return assets.values().toArray();
	}
	#cache = new Cache<Buffer>();
	constructor(url: string) {
		super(url, 'virtual', false);
		assets.add(this);
		logger.debug(url);
	}
	/** 构建方法 */
	abstract build(): PromiseOr<RouteContent>;
	async getContent() {
		// 构建模式
		if (getMode() === 'build') return this.build();
		// 缓存
		const cache = this.#cache.get();
		if (cache) return cache;
		// 构建
		const built = await this.build();
		// 输出
		return teeToCache(this.#cache, built);
	}
	/** 将资源标记为过期 */
	invalidated() {
		this.#cache.clean();
		broadcastUpdate(this.url);
	}
	destroy(): void {
		super.destroy();
		this.#cache.clean();
		assets.delete(this);
	}
}
