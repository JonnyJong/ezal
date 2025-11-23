import { Article, getConfig, Page, URL, VirtualAssets } from 'ezal';
import { SitemapStream } from 'sitemap';
import { getThemeConfig } from './config';

function getInfo(page: Page): {
	url: string;
	changefreq: string;
	img?: string;
} {
	let img = page.data?.cover;
	if (img) img = URL.resolve(page.url, img);
	return { url: page.url, changefreq: 'weekly', img };
}

class Sitemap extends VirtualAssets {
	constructor() {
		super('/sitemap.xml');
	}
	build() {
		const { site } = getConfig();
		const stream = new SitemapStream({ hostname: site.domain });

		stream.write({ url: '/' });
		const pre = getThemeConfig().home?.articlesPrePage ?? 10;
		const count = Math.ceil(Math.max(Article.getAll().length / pre, 1));
		for (let i = 2; i <= count; i++) stream.write({ url: `/${i}/` });

		for (const article of Article.getAll()) {
			if (article.data?.sitemap === false) continue;
			stream.write(getInfo(article));
		}

		for (const page of Page.getAll()) {
			if (!page.data?.sitemap) continue;
			stream.write(getInfo(page));
		}

		stream.end();

		return stream;
	}
	protected onDependenciesChanged() {}
}

let asset: Sitemap;

export function initSitemap() {
	asset = new Sitemap();
}

export function updateSitemap() {
	asset?.invalidated();
}
