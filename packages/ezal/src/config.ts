import path from 'node:path';
import { cosmiconfig } from 'cosmiconfig';
import type { HookOptions } from './hooks';
import type { ArticleUrlFormatter } from './items/article';
import type { TransformRule } from './items/asset';
import type { LayoutConfig } from './items/layout';
import type { PageHandler, PageUrlFormatter } from './items/page';
import { Logger } from './logger';
import { SCHEMA_EZAL_CONFIG } from './schema';
import type { LanguageCode, PromiseOr, TimeZoneId } from './types';
import { URL } from './utils/url';

const ERR = {
	EMPTY: 'Cannot find the configuration file or the configuration file is empty',
} as const;

const logger = new Logger('config');

//#region Define

export interface ThemeConfig {
	/**
	 * 主题资源目录
	 * @description
	 * 仅支持绝对路径
	 */
	assetsRoot: string;
	/**
	 * 转换规则
	 * @description
	 * 对于相同 `from` 的规则，排序靠后将覆盖之前的规则
	 */
	transformRules?: TransformRule[];
	/** 布局模版配置 */
	layout: LayoutConfig;
	/**
	 * 页面处理器
	 * @description
	 * 对于支持相同后缀名的处理器，排序靠后将覆盖之前的处理器
	 */
	pageHandlers: PageHandler[];
	/** 钩子 */
	hooks?: HookOptions;
}

export interface SiteConfig {
	/** 标题 */
	title: string;
	/** 描述 */
	description?: string;
	/** 关键词 */
	keywords?: string[];
	/** 作者 */
	author: string;
	/** 语言 */
	language: LanguageCode | `${LanguageCode}-${string}`;
	/**
	 * 时区
	 * @description
	 * 默认使用系统时区
	 */
	timezone?: TimeZoneId;
	/** 域名 */
	domain: `https://${string}.${string}`;
	/**
	 * 根目录
	 * @default `/`
	 */
	root?: `/${string}`;
	/**
	 * 页面链接格式
	 * @description
	 * 链接开头可选 `/`，若无将自动添加
	 * @default ({id})=>path.join('/',id,'/')
	 */
	pageUrlFormat?: PageUrlFormatter;
	/**
	 * 文章链接格式
	 * @description
	 * 链接开头可选 `/`，若无将自动添加
	 * @default ({src})=>path.join('/',src,'/')
	 */
	articleUrlFormat?: ArticleUrlFormatter;
}

export interface SourceConfig {
	/**
	 * 根目录
	 * @description
	 * 支持绝对路径和相对路径；相对路径将以配置文件所在目录起始
	 */
	root: string;
	/**
	 * 文章根目录
	 * @description
	 * 仅支持相对路径，以根目录起始
	 */
	article: string;
}

export interface ServerConfig {
	/**
	 * 端口
	 * @default 8080
	 */
	port?: number;
	/**
	 * 主机
	 * @default localhost
	 */
	host?: 'localhost' | '127.0.0.1' | '::1' | '0.0.0.0' | (string & {});
	/** 自动刷新 */
	autoReload?: boolean;
}

export interface EzalConfig {
	/** 站点设置 */
	site: SiteConfig;
	/** 源配置 */
	source: SourceConfig;
	/**
	 * 产物根目录
	 * @description
	 * 支持绝对路径和相对路径；相对路径将以配置文件所在目录起始
	 */
	outDir: string;
	/** 主题 */
	theme: ThemeConfig;
	/**
	 * 实时预览服务器配置
	 * @description
	 * 默认监听 localhost:8080，不自动刷新
	 */
	server?: ServerConfig;
}

/** 声明配置 */
export async function defineConfig(
	config: PromiseOr<EzalConfig> | (() => PromiseOr<EzalConfig>),
): Promise<EzalConfig> {
	if (typeof config !== 'function') return config;
	return await config();
}

//#region Resolve

let config: EzalConfig;
let workMode: 'build' | 'serve';
let isDryRun = false;

export function resolveConfig(configPath: string) {
	const configDir = path.join(configPath, '..');
	if (!path.isAbsolute(config.source.root)) {
		config.source.root = path.join(configDir, config.source.root);
	}
	if (workMode === 'build') config.server = undefined;
	if (config.site.root) {
		config.site.root = URL.normalize(config.site.root) as any;
		if (config.site.root !== '/' && config.site.root!.at(-1) === '/') {
			config.site.root = config.site.root!.slice(0, -1) as any;
		}
	}
}

/** 初始化配置 */
export async function initConfig(
	mode: 'build' | 'serve',
	dryRun?: boolean,
): Promise<void> {
	if (config) return;
	workMode = mode;
	isDryRun = !!dryRun;
	logger.log('Loading config...');
	const explorer = cosmiconfig('ezal');
	try {
		const result = await explorer.search();
		logger.debug(result);
		if (!result || result.isEmpty) return logger.fatal(new Error(ERR.EMPTY));
		config = await SCHEMA_EZAL_CONFIG.parseAsync(result.config);
		logger.debug('Origin config', config);
		resolveConfig(result.filepath);
		logger.debug('Resolved config', config);
	} catch (error) {
		logger.fatal(error);
	}
}

/** 获取配置 */
export function getConfig(): EzalConfig {
	return config;
}

/** 获取工作模式 */
export function getMode() {
	return workMode;
}

export function dryRun() {
	return isDryRun;
}
