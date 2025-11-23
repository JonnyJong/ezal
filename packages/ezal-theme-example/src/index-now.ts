import { Article, getConfig, Logger, Page } from 'ezal';
import IndexNow, { SEARCH_ENGINES } from 'indexnow';
import { getThemeConfig } from './config';

const logger = new Logger('theme:index-now');

export async function exeIndexNow() {
	const { site } = getConfig();
	const { indexNow } = getThemeConfig();
	if (!indexNow) return;

	logger.log('Collecting data...');
	const urls: string[] = [];
	for (const article of Article.getAll()) {
		if (article.data?.robots === false) continue;
		urls.push(site.domain + article.url);
	}
	for (const page of Page.getAll()) {
		if (!page.data?.robots) continue;
		urls.push(site.domain + page.url);
	}

	if (indexNow.bing) {
		logger.log('Submitting urls to Bing...');
		const bing = new IndexNow(SEARCH_ENGINES.BING, indexNow.bing);
		await bing.submitUrls(site.domain, urls);
	}

	if (indexNow.yandex) {
		logger.log('Submitting urls to Yandex...');
		const bing = new IndexNow(SEARCH_ENGINES.YANDEX, indexNow.yandex);
		await bing.submitUrls(site.domain, urls);
	}

	logger.log('Finished');
}
