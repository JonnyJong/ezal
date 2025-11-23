import type { Readable } from 'node:stream';
import { Dependent } from './items/dependent';
import { Logger } from './logger';
import { broadcastUpdate } from './server';
import type { AssetLevel, PromiseOr } from './types';
import { createMap } from './utils/level';
import { URL } from './utils/url';

export type RouteContent = Readable | string | Buffer;

const INFO = {
	URL: (url: string, dist: string) => `Route link: ${url}, dist: ${dist}`,
};

const ERR = {
	DESTROYED: 'This route has been destroyed',
	CONFLICT: (url: string) =>
		`Cannot assign to link "${url}", the new link is already in use`,
} as const;

const logger = new Logger('route');

function resolveUrlFallbacks(url: string): string[] {
	if (url.at(-1) === '/') return [URL.join(url, 'index.html')];
	return [url, URL.join(url, 'index.html')];
}

function resolveUrl(
	url: string,
	isPage?: boolean,
): [url: string, dist: string] {
	url = URL.normalize(url);
	if (!isPage) {
		if (url === '/') throw new Error('The link `/` must be a page');
		if (url.at(-1) === '/') url = url.slice(0, -1);
		return [url, url];
	}
	if (URL.extname(url).toLowerCase() === '.html') return [url, url];
	return [url, URL.join(url, 'index.html')];
}

const routeMap = createMap<Route>();

/** 路由节点 */
export abstract class Route extends Dependent {
	static find(url: string): Route | null {
		for (const level of ['virtual', 'user', 'theme'] as const) {
			const map = routeMap[level];
			for (const fallback of resolveUrlFallbacks(url)) {
				const route = map.get(fallback);
				if (route) return route;
			}
		}
		return null;
	}
	#level: AssetLevel;
	#isPage: boolean;
	#url!: string;
	#dist!: string;
	constructor(url: string, level: AssetLevel, isPage?: boolean) {
		super();
		this.#level = level;
		this.#isPage = !!isPage;
		this.updateURL(url);
		broadcastUpdate(this.url);
	}
	/**
	 * 作用级别
	 * @description
	 * 生成、路由时，按照以下优先级，优先级较低的将被覆盖：
	 * 1. `user`
	 * 2. `theme`
	 */
	get level() {
		return this.#level;
	}
	/** 链接 */
	get url() {
		return this.#url;
	}
	/** 产物相对路径 */
	get dist() {
		return this.#dist;
	}
	/** 清理路由 */
	#cleanRoute() {
		routeMap[this.#level].delete(this.#dist);
	}
	/** 设置路由 */
	#setupRoute() {
		routeMap[this.#level].set(this.#dist, this);
	}
	/** 更新链接 */
	protected updateURL(newURL: string) {
		if (this.destroyed) throw new Error(ERR.DESTROYED);
		const [url, dist] = resolveUrl(newURL, this.#isPage);
		if (dist !== this.#dist && routeMap[this.#level].has(dist)) {
			throw new Error(ERR.CONFLICT(newURL));
		}
		this.#cleanRoute();
		this.#url = url;
		this.#dist = dist;
		this.#setupRoute();
		logger.debug(INFO.URL(url, dist));
	}
	/** 销毁 */
	destroy() {
		if (this.destroyed) return;
		super.destroy();
		this.#cleanRoute();
	}
	/** 获取内容 */
	abstract getContent(): PromiseOr<RouteContent>;
}
