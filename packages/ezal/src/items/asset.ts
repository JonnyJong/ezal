import { createReadStream } from 'node:fs';
import { getConfig, getMode } from '../config';
import { hook } from '../hooks';
import { Logger } from '../logger';
import { Route, type RouteContent } from '../route';
import { broadcastUpdate } from '../server';
import type { ArrayOr, AssetLevel, PromiseOr } from '../types';
import { Cache, teeToCache } from '../utils/cache';
import { createMap, resolveSrc } from '../utils/level';
import { asArray } from '../utils/object';
import { URL } from '../utils/url';
import type { DependencyUpdateInfo } from './dependent';

//#region Define

/** 资源转换结果 */
export interface TransformResult {
	/** 转换结果 */
	result: RouteContent;
	/**
	 * 依赖
	 * @description
	 * 依赖文件路径需为绝对路径
	 */
	dependencies?: string[];
}

/**
 * 资源转换器
 * @param src 源文件绝对路径
 * @param url 产物链接
 */
export type Transformer = (
	src: string,
	url: string,
) => PromiseOr<TransformResult | Error>;

/** 资源转换规则 */
export interface TransformRule {
	/** 源文件后缀名 */
	from: ArrayOr<Lowercase<`.${string}`>>;
	/** 转换后文件后缀名 */
	to: Lowercase<`.${string}`>;
	/** 转换器 */
	transformer: Transformer;
}

//#region Main

const ERR = {
	MODIFY: 'Modifying asset url is not allowed',
} as const;

const ruleMap = new Map<string, TransformRule>();
const assetsMap = createMap<Asset>();

const logger = new Logger('assets');

const defaultTransformer = (src: string) => ({ result: createReadStream(src) });
const defaultRule = {
	from: [],
	to: '.',
	transformer: defaultTransformer,
} as const satisfies TransformRule;

function getRule(src: string): TransformRule {
	const ext = URL.extname(src).toLowerCase();
	return ruleMap.get(ext) ?? defaultRule;
}

function remapExt(src: string, to: string) {
	if (to === '.') return src;
	return URL.extname(src, to);
}

/** 资源路由节点 */
export class Asset extends Route {
	static getAll(level: Exclude<AssetLevel, 'virtual'>): Asset[] {
		return assetsMap[level].values().toArray();
	}
	/** 初始化规则 */
	static initRule() {
		const rules = getConfig().theme.transformRules;
		if (!rules) {
			logger.debug('No transform rule found');
			return;
		}
		for (const rule of rules) {
			for (const ext of asArray(rule.from)) {
				ruleMap.set(ext, rule);
			}
		}
		logger.debug(ruleMap);
		logger.debug(`Resolve ${ruleMap.size} transform rules`);
	}
	/** 添加资源 */
	static async add(
		src: string,
		level: Exclude<AssetLevel, 'virtual'>,
	): Promise<Asset> {
		let asset = assetsMap[level].get(src);
		if (asset) return asset;
		const filepath = resolveSrc(src, level);
		const rule = getRule(src);
		const url = remapExt(src, rule.to);
		asset = new Asset(url, src, filepath, level, rule.transformer);
		assetsMap[level].set(src, asset);
		await hook('asset:add', asset);
		return asset;
	}
	#src: string;
	#filepath: string;
	#transformer: Transformer;
	#cache = new Cache<Buffer>();
	protected constructor(
		url: string,
		src: string,
		filepath: string,
		level: AssetLevel,
		transformer: Transformer,
	) {
		super(url, level, false);
		this.#src = src;
		this.#filepath = filepath;
		this.#transformer = transformer;
		super.updateDependencies([this.#filepath]);
	}
	/** 源文件相对路径 */
	get src() {
		return this.#src;
	}
	/** 源文件绝对路径 */
	get filepath() {
		return this.#filepath;
	}
	protected updateURL(newUrl: string): void {
		if (this.url) throw new Error(ERR.MODIFY);
		super.updateURL(newUrl);
	}
	async getContent() {
		// 默认转换器
		if (this.#transformer === defaultTransformer) {
			await hook('asset:build:before', this);
			const { result } = defaultTransformer(this.#filepath);
			await hook('asset:build:after', this);
			return result;
		}
		// 构建模式
		if (getMode() === 'build') {
			await hook('asset:build:before', this);
			const transformed = await this.#transformer(this.#filepath, this.url);
			if (transformed instanceof Error) throw transformed;
			await hook('asset:build:after', this);
			return transformed.result;
		}
		// 缓存
		const cache = this.#cache.get();
		if (cache) return cache;
		// 转换
		await hook('asset:build:before', this);
		const transformed = await this.#transformer(this.#filepath, this.url);
		if (transformed instanceof Error) throw transformed;
		// 输出
		const { result, dependencies } = transformed;
		if (dependencies) super.updateDependencies([this.#filepath, ...dependencies]);
		await hook('asset:build:after', this);
		return teeToCache(this.#cache, result);
	}
	destroy(): void {
		super.destroy();
		assetsMap[this.level].delete(this.#src);
		hook('asset:remove', this);
	}
	/**
	 * 标记资源已过期
	 * @description
	 * 将会清除资源的缓存
	 */
	invalidate() {
		this.#cache.clean();
	}
	protected onDependenciesChanged([[_, type]]: DependencyUpdateInfo[]) {
		if (type === 'rm') return this.destroy();
		this.invalidate();
		broadcastUpdate(this.url);
		hook('asset:update', this);
	}
}
