import path from 'node:path';
import type { ThemeConfig as EzalThemeConfig } from 'ezal';
import { setThemeConfig, type ThemeConfig } from './config';
import { initFeed, updateFeedCategory, updateFeedItem } from './feed';
import { imageAddHook, imageRemoveHook, imageUpdateHook } from './image';
import { imageDB } from './image/db';
import { exeIndexNow } from './index-now';
import { layoutConfig } from './layout';
import { markdownPageHandler } from './markdown';
import { setupCodeblockStyle } from './markdown/codeblock';
import { initCodeblockStyle } from './markdown/codeblock/style';
import { init404Page } from './page/404';
import { updateArchivePage } from './page/archive';
import { updateCategoryPage } from './page/category';
import { updateHomePage } from './page/home';
import { updateTagPage } from './page/tag';
import {
	addPage,
	buildPagefind,
	initPagefind,
	rebuildPagefind,
	stopPagefind,
} from './pagefind';
import { initSitemap, updateSitemap } from './sitemap';
import { scriptTransformRule } from './transform/script';
import { styleTransformRule } from './transform/stylus';

export async function theme(config?: ThemeConfig): Promise<EzalThemeConfig> {
	setThemeConfig(config);
	imageDB.init();
	return {
		assetsRoot: path.join(__dirname, '../assets'),
		transformRules: [styleTransformRule, scriptTransformRule],
		layout: layoutConfig,
		pageHandlers: [await markdownPageHandler()],
		hooks: {
			'config:after': [initCodeblockStyle],
			'scan:after': [
				updateHomePage,
				updateArchivePage,
				updateCategoryPage,
				updateTagPage,
				init404Page,
				initPagefind,
				initSitemap,
				initFeed,
			],
			'asset:add': [imageAddHook],
			'asset:update': [imageUpdateHook],
			'asset:remove': [imageRemoveHook],
			'build:before:assets-virtual': [buildPagefind, updateSitemap],
			'build:after': [setupCodeblockStyle, stopPagefind, exeIndexNow],
			'article:add': [updateHomePage, updateArchivePage],
			'article:update': [
				updateHomePage,
				updateArchivePage,
				addPage,
				updateSitemap,
				updateFeedItem,
			],
			'article:remove': [
				updateHomePage,
				updateArchivePage,
				rebuildPagefind,
				updateSitemap,
				updateFeedItem,
			],
			'article:build:after': [addPage, updateFeedItem],
			'page:update': [addPage, updateSitemap],
			'page:remove': [rebuildPagefind, updateSitemap],
			'page:build:after': [addPage],
			'category:add': [updateCategoryPage],
			'category:update': [updateCategoryPage, updateFeedCategory],
			'category:remove': [updateCategoryPage, updateFeedCategory],
			'tag:add': [updateTagPage],
			'tag:update': [updateTagPage],
			'tag:remove': [updateTagPage],
			'preview:stop': [stopPagefind],
		},
	};
}
