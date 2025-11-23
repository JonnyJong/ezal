import { Article, Category, getConfig, URL, VirtualAssets } from 'ezal';
import { type Author, Feed, type Item } from 'feed';
import { getThemeConfig } from './config';
import { compareByDate } from './utils';

const FEED_TYPE_URL = {
	rss: '/rss.xml',
	atom: '/atom.xml',
	feed: '/feed.json',
} as const;

let author: Author;
let feed: Feed;
let assets: { rss: FeedAsset; atom: FeedAsset; feed: FeedAsset };

class FeedAsset extends VirtualAssets {
	#type: 'rss' | 'atom' | 'feed';
	constructor(type: 'rss' | 'atom' | 'feed') {
		super(FEED_TYPE_URL[type]);
		this.#type = type;
	}
	build() {
		switch (this.#type) {
			case 'rss':
				return feed.rss2();
			case 'atom':
				return feed.atom1();
			case 'feed':
				return feed.json1();
			default:
				return '';
		}
	}
	protected onDependenciesChanged() {}
}

export function initFeed() {
	const { site } = getConfig();
	const theme = getThemeConfig();
	const since = theme.since?.year;
	author = { name: site.author, link: site.domain };
	feed = new Feed({
		title: site.title,
		description: site.description,
		id: site.domain,
		language: site.language,
		favicon: theme.favicon?.[0],
		copyright: `© ${since ? `${since}-` : ''}${new Date().getFullYear()} ${site.author}`,
		author,
		updated: new Date(),
		feedLinks: {
			rss: `${site.domain}/rss.xml`,
			atom: `${site.domain}/atom.xml`,
			json: `${site.domain}/feed.json`,
		},
	});
	assets = {
		rss: new FeedAsset('rss'),
		atom: new FeedAsset('atom'),
		feed: new FeedAsset('feed'),
	};
	for (const article of Article.getAll().sort(compareByDate)) {
		updateFeedItem(article);
	}
	for (const category of Category.getAll()) {
		updateFeedCategory(category);
	}
}

function refreshAsset() {
	if (!assets) return;
	assets.rss.invalidated();
	assets.atom.invalidated();
	assets.feed.invalidated();
}

export function updateFeedItem(article: Article) {
	if (!feed) return;
	const i = feed.items.findIndex((item) => item.id === article.id);
	// Delete
	if (article.destroyed) {
		if (i === -1) return;
		feed.items.splice(i, 1);
		return refreshAsset();
	}
	// Update
	const { site } = getConfig();
	let image = article.data?.cover
		? URL.resolve(article.url, article.data.cover)
		: undefined;
	if (image) image = site.domain + image;
	const item: Item = {
		title: article.title,
		id: article.id,
		link: site.domain + article.url,
		description: article.description,
		content: article.content,
		author: [author],
		date: new Date(article.date.toInstant().epochMilliseconds),
		image,
		category: article.categories
			.values()
			.toArray()
			.map((category) => ({ name: category.path.join('/') })),
	};
	if (i === -1) feed.addItem(item);
	else feed.items[i] = item;
	refreshAsset();
}

export function updateFeedCategory(category: Category) {
	if (!feed) return;
	const name = category.path.join('/');
	const i = feed.categories.indexOf(name);
	// Delete
	if (category.destroyed) {
		if (i === -1) return;
		feed.categories.splice(i, 1);
		return refreshAsset();
	}
	// Update
	if (i !== -1) return;
	feed.addCategory(name);
	refreshAsset();
}
