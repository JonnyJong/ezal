import type { Temporal } from '@js-temporal/polyfill';
import type { ArrayOr } from 'ezal';
import type { TokenizeOptions } from 'ezal-markdown';
import type { RawTheme } from 'shiki';

export interface NavItem {
	name: string;
	link: string;
}

export interface Contact {
	url: string;
	name: string;
	icon: string;
	color: string;
}

export interface Link {
	name: string;
	description: string;
	link: string;
	avatar: string;
	color: string;
}

export interface LinkGroup {
	title: string;
	description: string;
	items: Link[];
}

export type LinkPageStyles =
	| 'image'
	| 'table'
	| 'heading'
	| 'list'
	| 'footnote'
	| 'tabs'
	| 'note'
	| 'fold'
	| 'kbd';

export interface ThemeConfig {
	/** 导航栏 */
	nav?: NavItem[];
	/** 站点图标 */
	favicon?: ArrayOr<string>;
	/** 主题色 */
	color?: {
		/** @default '#006000' */
		light?: string;
		/** @default '#00BB00' */
		dark?: string;
	};
	/** 建站时间 */
	since?: Temporal.ZonedDateTime;
	/** 联系方式 */
	contact?: Contact[];
	/** 友情链接 */
	links?: LinkGroup[];
	/**
	 * 友情链接页面启用的样式
	 * @default 全部启用
	 */
	linkPageStyles?: LinkPageStyles[];
	/** Markdown 配置 */
	markdown?: {
		/**
		 * 换行规则
		 * @description
		 * - `common-mark`：CommonMark 规范，行尾 2+ 空格渲染为换行
		 * - `soft`：软换行，换行符 `\n` 渲染为换行
		 * @default `common-mark`
		 */
		lineBreak?: TokenizeOptions['lineBreak'];
		/**
		 * 代码块主题
		 * @default {light:'light-plus',dark:'dark-plus'}
		 */
		codeBlockTheme?: { light: RawTheme; dark: RawTheme };
	};
	/** 主页设置 */
	home?: {
		/**
		 * 每页文章数量
		 * @default 10
		 */
		articlesPrePage?: number;
		logo?: {
			viewBox: string;
			g: string;
		};
		slogan?: string;
	};
	imageCache?: {
		/**
		 * 图像元数据缓存路径
		 * @description
		 * 支持绝对路径和相对路径，相对路径将以工作目录为起点。
		 * 默认为工作目录下 `image-metadata.sqlite`。
		 */
		metadata?: string;
		/**
		 * 优化版图像缓存路径
		 * @description
		 * 支持绝对路径和相对路径，相对路径将以工作目录为起点。
		 * 默认为工作目录下 `cache`。
		 */
		optimized?: string;
	};
	cdn?: {
		/** @default 'https://unpkg.com/katex@0.16.21/dist/katex.min.css' */
		katex?: string;
		/** @default 'https://unpkg.com/@waline/client@v3/dist/waline.css' */
		walineCSS?: string;
		/** @default 'https://unpkg.com/@waline/client@v3/dist/waline.js' */
		walineJS?: string;
		/** @default 'https://unpkg.com/mermaid@11/dist/mermaid.esm.min.mjs' */
		mermaid?: string;
	};
	/** HTML 头部插入内容 */
	inject?: string;
	/** IndexNow 配置 */
	indexNow?: {
		/** Bing IndexNow 密钥 */
		bing?: string;
		/** Yandex IndexNow 密钥 */
		yandex?: string;
	};
	/** Waline 评论配置 */
	waline?: {
		/** 后端地址 */
		serverURL: string;
		visitor?: boolean;
		commentCount?: boolean;
		pageview?: boolean;
		emoji?: string[];
		reaction?: string[];
	};
}

let config: ThemeConfig;

export function setThemeConfig(cfg?: ThemeConfig) {
	config = cfg ?? {};
}

export function getThemeConfig() {
	return config;
}
