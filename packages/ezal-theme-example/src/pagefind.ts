import {
	Article,
	getConfig,
	getMode,
	Logger,
	Page,
	type PromiseOr,
	VirtualAssets,
} from 'ezal';
import type { RouteContent } from 'ezal/dist/route';
import type * as pagefind from 'pagefind';

const logger = new Logger('theme:index');

let index: pagefind.PagefindIndex;
const assets = new Map<string, PagefindIndex>();

class PagefindIndex extends VirtualAssets {
	buffer: Buffer;
	constructor(url: string, buffer: Buffer) {
		super(url);
		this.buffer = buffer;
	}
	build(): PromiseOr<RouteContent> {
		return this.buffer;
	}
	protected onDependenciesChanged() {}
}

/** 重建索引文件虚拟资源 */
async function rebuildIndexFile() {
	if (!index) return;
	const { errors, files } = await index.getFiles();
	if (errors.length > 0) {
		if (getMode() === 'build') logger.fatal(errors);
		else logger.error(errors);
		return;
	}
	const fileMap = new Map(
		files.map(({ path, content }) => [path, Buffer.from(content)]),
	);
	for (const [path, asset] of assets.entries().toArray()) {
		if (fileMap.has(path)) continue;
		asset.destroy();
		assets.delete(path);
	}
	for (const [path, buffer] of fileMap) {
		let asset = assets.get(path);
		if (asset) {
			asset.buffer = buffer;
			asset.invalidated();
			continue;
		}
		asset = new PagefindIndex(path, buffer);
		assets.set(path, asset);
	}
}

/**
 * 添加页面
 * @description 构建模式下需启用强制才能添加索引
 */
export async function addPage(page: Page, force?: boolean): Promise<string[]> {
	if (!index) return [];
	if (getMode() === 'build' && !force) return [];

	const allowIndex = page.data?.index;
	if (page instanceof Article) {
		if (allowIndex === false) return [];
	} else if (!allowIndex) return [];

	const { errors } = await index.addCustomRecord({
		url: page.url,
		content: page.content ?? page.markdownContent ?? '',
		language: getConfig().site.language,
		meta: { title: page.title },
	});
	if (errors.length > 0) logger.error(errors);
	if (!force) await rebuildIndexFile();
	return errors;
}

/** 创建所有页面索引 */
async function buildAllIndex(): Promise<string[]> {
	const errors: string[] = [];
	for (const article of Article.getAll()) {
		errors.push(...(await addPage(article, true)));
	}
	for (const page of Page.getAll()) {
		errors.push(...(await addPage(page, true)));
	}
	return errors;
}

/**
 * 清除并重建索引
 * @description 构建模式下无效
 */
export async function rebuildPagefind() {
	if (!index) return;
	if (getMode() === 'build') return;
	await index.deleteIndex();
	const pagefind = await import('pagefind');
	const response = await pagefind.createIndex();
	if (!response.index) throw response.errors;
	index = response.index;
	await buildAllIndex();
	await rebuildIndexFile();
}

/** 构建 Pagefind */
export async function buildPagefind() {
	if (!index) throw new Error('Pagefind not initialized');
	await buildAllIndex();
	await rebuildIndexFile();
}

/**
 * 初始化 PageFind
 * @description 构建模式下不会构建索引
 */
export async function initPagefind() {
	if (index) return;
	const pagefind = await import('pagefind');
	const response = await pagefind.createIndex();
	if (!response.index) throw response.errors;
	index = response.index;
	if (getMode() === 'build') return;
	await rebuildPagefind();
}

/** 停止 PageFind */
export async function stopPagefind() {
	const pagefind = await import('pagefind');
	await pagefind.close();
}
