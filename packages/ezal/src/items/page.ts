import path from 'node:path';
import { getConfig } from '../config';
import { hook } from '../hooks';
import { Logger } from '../logger';
import { Route } from '../route';
import { broadcastUpdate } from '../server';
import type { ArrayOr, PromiseOr } from '../types';
import { injectAutoReload } from '../utils/html';
import { asArray, resolveProps } from '../utils/object';
import { URL } from '../utils/url';
import type { DependencyUpdateInfo } from './dependent';
import { Layout } from './layout';

//#region Define

/** 页面内容 */
export interface PageContent {
	content: string;
	data: Record<string, any>;
	dependencies?: string[];
}

/** 页面解析器 */
export type PageParser = (filepath: string) => PromiseOr<PageContent | Error>;

/** 页面渲染结果 */
export interface PageRendered {
	html: string;
	data: Record<string, any>;
}

/** 页面渲染器 */
export type PageRenderer = (
	content: string,
	page: Page,
) => PromiseOr<PageRendered | Error>;

/** 页面处理器 */
export interface PageHandler {
	exts: ArrayOr<Lowercase<`.${string}`>>;
	parser: PageParser;
	renderer: PageRenderer;
}

/** 页面链接格式上下文 */
export interface PageUrlFormatContext {
	id: string;
	src: string;
	title: string;
	data: Record<string, any>;
}

/** 页面链接生成器 */
export type PageUrlFormatter = (context: PageUrlFormatContext) => string;

interface PageProps {
	title: string;
	description: string;
	layout: string;
	keywords: string[];
}

//#region Main

const INFO = {
	PRE_INIT: (count: number) => `There are ${count} processors in total`,
	POST_INIT: (count: number) => `A total of ${count} page file types`,
	ADDED: (src: string) => `A page was added: ${src}`,
} as const;
const ERR = {
	PARSE: (path: string) => `Failed to parse page file "	${path}"`,
	NO_LAYOUT: (layout: string, path: string) =>
		`Cannot find the "${layout}" layout: ${path}`,
} as const;

const logger = new Logger('page');

const handlerMap = new Map<string, PageHandler>();
const pages = new Map<string, Page>();

function defaultUrl(filepath: string) {
	const { source } = getConfig();
	return URL.extname(URL.normalize(path.relative(source.root, filepath)), '');
}

function resolvePageProps(
	props: Record<string, any>,
	filepath: string,
): Promise<PageProps> {
	return resolveProps(props, {
		title: ['title', String, () => defaultUrl(filepath)],
		description: ['description', String, () => ''],
		layout: ['layout', String, () => 'page'],
		keywords: [['keywords', 'keyword'], (v) => asArray(v).map(String), () => []],
	});
}

export class Page extends Route {
	static findHandler(src: string): PageHandler | undefined {
		return handlerMap.get(path.extname(src).toLowerCase());
	}
	/** 获取所有页面 */
	static getAll(): Page[] {
		return pages.values().toArray();
	}
	/** 初始化处理器 */
	static initHandlers() {
		const handlers = getConfig().theme.pageHandlers;
		logger.debug(INFO.PRE_INIT(handlers.length), handlers);
		for (const handler of handlers) {
			for (const ext of asArray(handler.exts)) {
				handlerMap.set(ext, handler);
			}
		}
		logger.debug(INFO.POST_INIT(handlerMap.size), handlerMap);
	}
	/**
	 * 添加页面
	 * @returns 若返回 `null`，则表示没有对应的页面处理器
	 */
	static async add(src: string): Promise<Page | null> {
		const filepath = path.join(getConfig().source.root, src);
		let page = pages.get(filepath);
		if (page) return page;
		const handler = Page.findHandler(src);
		if (!handler) return null;
		const { dir, base, name } = path.parse(src);
		page = new Page(
			path.posix.join(dir, name),
			path.posix.join(dir, base),
			src,
			filepath,
			handler,
		);
		pages.set(filepath, page);
		logger.debug(INFO.ADDED(src));
		await hook('page:add', page);
		await page.update();
		return page;
	}
	/** 页面 ID（无后缀名） */
	#id: string;
	/** 页面相对路径 */
	#src: string;
	/** 页面文件路径 */
	#filepath: string;
	/** 页面依赖 */
	#dependencies?: string[];
	/** 页面处理器 */
	#handler: PageHandler;
	/** 页面内容 */
	#content?: string;
	/** 页面数据 */
	#data?: Record<string, any>;
	/** 页面内容渲染结果 */
	#rendered?: PageRendered;
	/** 模版包装结果 */
	#html?: string;
	#title = '';
	#description = '';
	#layout = 'page';
	#keywords: string[] = [];
	protected constructor(
		id: string,
		src: string,
		url: string,
		filepath: string,
		handler: PageHandler,
	) {
		super(url, 'user', true);
		this.#id = id;
		this.#src = src;
		this.#filepath = filepath;
		this.#handler = handler;
		super.updateDependencies([this.#filepath]);
	}
	/** 页面文件路径 */
	get filepath() {
		return this.#filepath;
	}
	/** 页面 ID（无后缀名） */
	get id() {
		return this.#id;
	}
	/** 页面相对路径 */
	get src() {
		return this.#src;
	}
	/** 页面标题 */
	get title() {
		return this.#title;
	}
	protected set title(value) {
		this.#title = value;
	}
	/** 页面描述 */
	get description() {
		return this.#description;
	}
	/** 页面模版 */
	get layout() {
		return this.#layout;
	}
	protected set layout(value) {
		this.#layout = value;
	}
	/** 页面关键词 */
	get keywords() {
		return [...this.#keywords];
	}
	/** 页面属性数据 */
	get data() {
		return this.#data;
	}
	/** 页面内容（Markdown） */
	get markdownContent() {
		return this.#content;
	}
	/** 页面内容（HTML） */
	get content() {
		return this.#rendered?.html;
	}
	get renderedData() {
		return this.#rendered?.data;
	}
	/** 重置页面信息 */
	protected reset() {
		this.#content = undefined;
		this.#data = undefined;
		this.#dependencies = undefined;
		this.#rendered = undefined;
		this.#html = undefined;
		this.#title = '';
		this.#description = '';
		this.#layout = 'page';
		this.#keywords = [];
		super.updateDependencies([this.#filepath]);
	}
	/** 解析页面数据 */
	protected async resolveData(data: Record<string, any>) {
		const { title, description, layout, keywords } = await resolvePageProps(
			data,
			this.#filepath,
		);
		this.#title = title;
		this.#description = description;
		this.#layout = layout;
		this.#keywords = keywords;
	}
	/** 解析页面链接 */
	protected resolveUrl() {
		const { pageUrlFormat: formatter } = getConfig().site;
		if (!formatter) {
			super.updateURL(URL.join('/', this.#id, '/'));
			return;
		}
		super.updateURL(
			formatter({
				id: this.#id,
				title: this.#title,
				src: this.#src,
				data: this.#data!,
			}),
		);
	}
	/**
	 * 更新页面
	 * @description
	 * 从页面对应文件重新读取
	 */
	protected async update(): Promise<Error | null> {
		this.reset();
		const parsed = await this.#handler.parser(this.#filepath);
		if (parsed instanceof Error) {
			logger.error(ERR.PARSE(this.#filepath), parsed);
			hook('page:update', this);
			return parsed;
		}
		this.#content = parsed.content;
		this.#data = parsed.data;
		this.#dependencies = parsed.dependencies;
		if (this.#dependencies) {
			super.updateDependencies([this.#filepath, ...this.#dependencies]);
		}
		await this.resolveData(this.#data);
		try {
			this.resolveUrl();
		} catch (error) {
			logger.error(error);
			this.reset();
		}
		if (this.update === Page.prototype.update) await hook('page:update', this);
		return null;
	}
	async getContent() {
		// Cache
		if (this.#html !== undefined) return this.#html;
		// Content
		if (this.update === Page.prototype.update) {
			await hook('page:build:before', this);
		}
		if (this.#content === undefined || this.#data === undefined) {
			const error = await this.update();
			if (error) throw error;
		}
		// Render Content
		if (this.#rendered === undefined) {
			const result = await this.#handler.renderer(this.#content!, this);
			if (result instanceof Error) throw result;
			this.#rendered = result;
		}
		// Layout
		const layout = await Layout.get(this.#layout);
		if (!layout) throw new Error(ERR.NO_LAYOUT(this.#layout, this.#filepath));
		// Layout Renderer
		const renderer = await layout.getRenderer();
		if (renderer instanceof Error) throw renderer;
		// Layout Dependencies
		const dependencies = [this.#filepath];
		if (this.#dependencies) dependencies.push(...this.#dependencies);
		dependencies.push(...layout.dependencies);
		super.updateDependencies(dependencies);
		// Render Layout
		const result = await renderer(this);
		if (result instanceof Error) throw result;
		if (getConfig().server?.autoReload) {
			this.#html = await injectAutoReload(result);
		} else this.#html = result;
		if (this.update === Page.prototype.update) {
			await hook('page:build:after', this);
		}
		return this.#html;
	}
	destroy(): void {
		super.destroy();
		pages.delete(this.#filepath);
		hook('page:remove', this);
	}
	protected onDependenciesChanged(updates: DependencyUpdateInfo[]) {
		let needUpdate = false;
		for (const [file, type] of updates) {
			if (file === this.#filepath && type === 'rm') return this.destroy();
			if (file === this.#filepath || this.#dependencies?.includes(file)) {
				needUpdate = true;
				break;
			}
		}
		broadcastUpdate(this.url);
		if (needUpdate) return this.update();
		const dependencies = [this.#filepath];
		if (this.#dependencies) dependencies.push(...this.#dependencies);
		super.updateDependencies(dependencies);
		this.#html = undefined;
	}
}
