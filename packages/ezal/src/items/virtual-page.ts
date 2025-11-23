import { getConfig } from '../config';
import { Route } from '../route';
import { broadcastUpdate } from '../server';
import { injectAutoReload } from '../utils/html';
import type { DependencyUpdateInfo } from './dependent';
import { Layout } from './layout';
import type { PageUrlFormatContext } from './page';

export interface VirtualPageInit {
	/**
	 * 页面 ID
	 * @description
	 * 无后缀名，无前缀 `/`
	 */
	id: string;
	/** 页面相对路径 */
	src: string;
	/** 页面标题 */
	title?: string;
	/** 页面描述 */
	description?: string;
	/** 页面模版 */
	layout: string;
	/** 页面关键词 */
	keywords?: string[];
	/** 页面属性数据 */
	data?: Record<string, any>;
	/** 自定义依赖项 */
	dependencies?: string[];
}

const ERR = {
	NO_LAYOUT: (layout: string) => `Cannot find the "${layout}" layout`,
} as const;

const pages = new Set<VirtualPage>();

function resolveUrl(context: PageUrlFormatContext): string {
	const { pageUrlFormat: formatter } = getConfig().site;
	if (!formatter) return context.id;
	return formatter(context);
}

/**
 * 虚拟页面
 * @description
 * 自带缓存，优先级高于用户页面
 */
export class VirtualPage extends Route {
	static getAll(): VirtualPage[] {
		return pages.values().toArray();
	}
	#id: string;
	#src: string;
	#title: string;
	#description: string;
	#layout: string;
	#keywords: string[];
	#data: Record<string, any>;
	#dependencies: string[];
	#layoutDependencies: string[] = [];
	#html?: string;
	constructor(options: VirtualPageInit) {
		super(
			resolveUrl({
				id: options.id,
				title: options.title ?? options.id,
				src: options.src,
				data: options.data ?? {},
			}),
			'virtual',
			true,
		);
		this.#id = options.id;
		this.#src = options.src;
		this.#title = options.title ?? options.id;
		this.#description = options.description ?? '';
		this.#layout = options.layout;
		this.#keywords = options.keywords ?? [];
		this.#data = options.data ?? {};
		this.#dependencies = options.dependencies ?? [];
		this.updateDependencies(this.#dependencies);
		pages.add(this);
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
	set title(value) {
		this.#title = value;
	}
	/** 页面描述 */
	get description() {
		return this.#description;
	}
	set description(value) {
		this.#description = value;
	}
	/** 页面模版 */
	get layout() {
		return this.#layout;
	}
	set layout(value) {
		this.#layout = value;
	}
	/** 页面关键词 */
	get keywords() {
		return this.#keywords;
	}
	set keywords(value) {
		this.#keywords = value;
	}
	/** 页面属性数据 */
	get data() {
		return this.#data;
	}
	set data(value) {
		this.#data = value;
	}
	/** 自定义依赖项 */
	get customDependencies() {
		return this.#dependencies;
	}
	set customDependencies(value) {
		this.#dependencies = value;
	}
	protected updateDependencies(dependencies: string[]): void {
		super.updateDependencies([
			...dependencies,
			...this.#dependencies,
			...this.#layoutDependencies,
		]);
	}
	update() {
		this.#html = undefined;
		this.#layoutDependencies = [];
		this.updateDependencies([]);
		super.updateURL(
			resolveUrl({
				id: this.id,
				title: this.title,
				src: this.src,
				data: this.data,
			}),
		);
	}
	collectData(): Record<string, any> {
		return {
			...this.#data,
			title: this.title,
			layout: this.layout,
			keywords: this.keywords,
			type: 'page',
		};
	}
	async getContent() {
		// Cache
		if (this.#html !== undefined) return this.#html;
		// Layout
		const layout = await Layout.get(this.#layout);
		if (!layout) throw new Error(ERR.NO_LAYOUT(this.#layout));
		// Layout Renderer
		const renderer = await layout.getRenderer();
		if (renderer instanceof Error) throw renderer;
		this.#layoutDependencies = layout.dependencies;
		this.updateDependencies([]);
		// Render Layout
		const result = await renderer(this);
		if (result instanceof Error) throw result;
		if (getConfig().server?.autoReload) {
			this.#html = await injectAutoReload(result);
		} else this.#html = result;
		return this.#html;
	}
	protected onDependenciesChanged(updates: DependencyUpdateInfo[]) {
		this.#html = undefined;
		let needUpdate = false;
		for (const [file] of updates) {
			if (!this.#dependencies.includes(file)) continue;
			needUpdate = true;
			break;
		}
		broadcastUpdate(this.url);
		this.#layoutDependencies = [];
		if (needUpdate) return this.update();
		this.updateDependencies([]);
	}
	/** 将资源标记为过期 */
	invalidated() {
		this.#html = undefined;
		broadcastUpdate(this.url);
		this.#layoutDependencies = [];
		this.update();
	}
	destroy(): void {
		super.destroy();
		pages.delete(this);
	}
}
