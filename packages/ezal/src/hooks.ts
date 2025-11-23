import { getConfig } from './config';
import type { Article } from './items/article';
import type { Asset } from './items/asset';
import type { Category } from './items/category';
import type { Page } from './items/page';
import type { Tag } from './items/tag';
import { Logger } from './logger';
import type { ArrayOr } from './types';
import { asArray } from './utils/object';

export type HookHandler<T = undefined> = (data: T) => any;

export interface HookOptions {
	/** 配置解析后 */
	'config:after'?: ArrayOr<HookHandler>;
	/** 扫描前 */
	'scan:before'?: ArrayOr<HookHandler>;
	/** 扫描后 */
	'scan:after'?: ArrayOr<HookHandler>;
	/** 构建前（仅限构建模式） */
	'build:before'?: ArrayOr<HookHandler>;
	/** 构建主题资源前（仅限构建模式） */
	'build:before:assets-theme'?: ArrayOr<HookHandler>;
	/** 构建主题资源后（仅限构建模式） */
	'build:after:assets-theme'?: ArrayOr<HookHandler>;
	/** 构建用户资源前（仅限构建模式） */
	'build:before:assets-user'?: ArrayOr<HookHandler>;
	/** 构建用户资源后（仅限构建模式） */
	'build:after:assets-user'?: ArrayOr<HookHandler>;
	/** 构建文章前（仅限构建模式） */
	'build:before:articles'?: ArrayOr<HookHandler>;
	/** 构建文章后（仅限构建模式） */
	'build:after:articles'?: ArrayOr<HookHandler>;
	/** 构建页面前（仅限构建模式） */
	'build:before:pages'?: ArrayOr<HookHandler>;
	/** 构建页面后（仅限构建模式） */
	'build:after:pages'?: ArrayOr<HookHandler>;
	/** 构建虚拟资源前（仅限构建模式） */
	'build:before:assets-virtual'?: ArrayOr<HookHandler>;
	/** 构建虚拟资源后（仅限构建模式） */
	'build:after:assets-virtual'?: ArrayOr<HookHandler>;
	/** 构建虚拟页面前（仅限构建模式） */
	'build:before:pages-virtual'?: ArrayOr<HookHandler>;
	/** 构建虚拟页面后（仅限构建模式） */
	'build:after:pages-virtual'?: ArrayOr<HookHandler>;
	/** 构建后（仅限构建模式） */
	'build:after'?: ArrayOr<HookHandler>;
	/** 资源添加 */
	'asset:add'?: ArrayOr<HookHandler<Asset>>;
	/** 资源更新 */
	'asset:update'?: ArrayOr<HookHandler<Asset>>;
	/** 资源移除 */
	'asset:remove'?: ArrayOr<HookHandler<Asset>>;
	/** 资源构建前 */
	'asset:build:before'?: ArrayOr<HookHandler<Asset>>;
	/** 资源构建后 */
	'asset:build:after'?: ArrayOr<HookHandler<Asset>>;
	/** 页面添加 */
	'page:add'?: ArrayOr<HookHandler<Page>>;
	/** 页面更新 */
	'page:update'?: ArrayOr<HookHandler<Page>>;
	/** 页面移除 */
	'page:remove'?: ArrayOr<HookHandler<Page>>;
	/** 页面构建前 */
	'page:build:before'?: ArrayOr<HookHandler<Page>>;
	/** 页面构建后 */
	'page:build:after'?: ArrayOr<HookHandler<Page>>;
	/** 文章添加 */
	'article:add'?: ArrayOr<HookHandler<Article>>;
	/** 文章更新 */
	'article:update'?: ArrayOr<HookHandler<Article>>;
	/** 文章移除 */
	'article:remove'?: ArrayOr<HookHandler<Article>>;
	/** 文章构建前 */
	'article:build:before'?: ArrayOr<HookHandler<Article>>;
	/** 文章构建后 */
	'article:build:after'?: ArrayOr<HookHandler<Article>>;
	/** 分类添加 */
	'category:add'?: ArrayOr<HookHandler<Category>>;
	/** 分类更新 */
	'category:update'?: ArrayOr<HookHandler<Category>>;
	/** 分类移除 */
	'category:remove'?: ArrayOr<HookHandler<Category>>;
	/** 标签添加 */
	'tag:add'?: ArrayOr<HookHandler<Tag>>;
	/** 标签更新 */
	'tag:update'?: ArrayOr<HookHandler<Tag>>;
	/** 标签移除 */
	'tag:remove'?: ArrayOr<HookHandler<Tag>>;
	/** 停止预览模式 */
	'preview:stop'?: ArrayOr<HookHandler>;
}

type HookHandlerParameter<K extends keyof HookOptions> = HookOptions[K] extends
	| ArrayOr<HookHandler<infer T>>
	| undefined
	? T
	: undefined;

const logger = new Logger('hook');

export async function hook<K extends keyof HookOptions>(
	key: K,
	data: HookHandlerParameter<K>,
) {
	const { hooks: hookMap } = getConfig().theme;
	if (!hookMap) return;
	const hooks = hookMap[key] as HookHandler<HookHandlerParameter<K>>[];
	if (!hooks) return;
	logger.debug(key, data);
	for (const hook of asArray(hooks)) {
		// biome-ignore lint/performance/noAwaitInLoops: Hooks need to be executed in order
		await hook(data);
	}
}
