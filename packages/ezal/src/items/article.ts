import type { Stats } from 'node:fs';
import path from 'node:path';
import { Temporal } from '@js-temporal/polyfill';
import { getConfig } from '../config';
import { hook } from '../hooks';
import { Logger } from '../logger';
import fs from '../utils/fs';
import { asArray, resolveProps } from '../utils/object';
import { isSubPath } from '../utils/path';
import { Time } from '../utils/time';
import { URL } from '../utils/url';
import { Category } from './category';
import { Page } from './page';
import { Tag } from './tag';

//#region Define

/** 文章链接格式上下文 */
export interface ArticleUrlFormatContext {
	id: string;
	src: string;
	title: string;
	date: Temporal.ZonedDateTime;
	data: Record<string, any>;
}

/** 文章链接生成器 */
export type ArticleUrlFormatter = (context: ArticleUrlFormatContext) => string;

interface ArticleProps {
	layout: string;
	date: Temporal.ZonedDateTime;
	updated: Temporal.ZonedDateTime;
	categories: string[][];
	tags: string[];
}

//#region Main

const INFO = {
	ADDED: (src: string) => `An article was added: ${src}`,
} as const;

const logger = new Logger('article');

const articles = new Map<string, Article>();

function getArticleId(filepath: string): string | null {
	const { root, article } = getConfig().source;
	const articleRoot = path.join(root, article);
	if (!isSubPath(articleRoot, filepath)) return null;
	return URL.extname(URL.normalize(path.relative(articleRoot, filepath)), '');
}

async function resolveArticleProps(
	props: Record<string, any>,
	filepath: string,
): Promise<ArticleProps> {
	const timezone = Temporal.Now.timeZoneId();
	let stat: Stats | undefined;
	async function getStat() {
		if (stat) return stat;
		const stats = await fs.stat(filepath);
		if (stats instanceof Error) throw stats;
		stat = stats;
		return stat;
	}
	const getDate = async () =>
		Time.from((await getStat()).ctime.getTime(), timezone);
	const getUpdated = async () =>
		Time.from((await getStat()).mtime.getTime(), timezone);
	return await resolveProps(props, {
		layout: ['layout', String, () => 'article'],
		date: ['date', async (v) => Time.parseDate(v) ?? (await getDate()), getDate],
		updated: [
			'updated',
			async (v) => Time.parseDate(v) ?? (await getUpdated()),
			getUpdated,
		],
		tags: [['tags', 'tag'], (v) => asArray(v).map(String), () => []],
		categories: [
			['categorize', 'categories', 'category'],
			(v) => asArray(v).map((v) => asArray(v).map(String)),
			() => [],
		],
	});
}

export class Article extends Page {
	/** 获取所有文章 */
	static getAll(): Article[] {
		return articles.values().toArray();
	}
	/** 添加文章 */
	static async add(src: string): Promise<Article | null> {
		const filepath = path.join(getConfig().source.root, src);
		let article = articles.get(filepath);
		if (article) return article;
		const handler = Page.findHandler(src);
		if (!handler) return null;
		const id = getArticleId(filepath);
		if (!id) return null;
		article = new Article(id, path.posix.normalize(src), src, filepath, handler);
		articles.set(filepath, article);
		logger.debug(INFO.ADDED(src));
		await hook('article:add', article);
		await article.update();
		return article;
	}
	#date: Temporal.ZonedDateTime = Time.now();
	#updated: Temporal.ZonedDateTime = Time.now();
	#categories = new Set<Category>();
	#tags = new Map<string, Tag>();
	/** 文章创建时间日期 */
	get date() {
		return this.#date;
	}
	/** 文章更新时间日期 */
	get updated() {
		return this.#updated;
	}
	/** 文章分类 */
	get categories() {
		return this.#categories;
	}
	/** 文章标签 */
	get tags() {
		return this.#tags;
	}
	protected reset() {
		super.reset();
		super.layout = 'article';
	}
	protected async resolveData(data: Record<string, any>) {
		await super.resolveData(data);
		const { layout, date, updated, categories, tags } = await resolveArticleProps(
			data,
			super.filepath,
		);
		this.layout = layout;
		this.#date = date;
		this.#updated = updated;
		const newCategories = new Set(categories);
		EXISTS: for (const category of this.#categories.values().toArray()) {
			for (const path of newCategories) {
				if (category.isPath(path)) {
					newCategories.delete(path);
					continue EXISTS;
				}
			}
			this.#categories.delete(category);
			category.removeArticle(this);
		}
		for (const path of newCategories) {
			this.#categories.add(Category.setArticle(path, this));
		}
		const newTags = new Set(tags);
		for (const [name, tag] of this.#tags.entries().toArray()) {
			if (newTags.has(name)) {
				newTags.delete(name);
				continue;
			}
			this.#tags.delete(name);
			tag.removeArticle(this);
		}
		for (const name of newTags) {
			this.#tags.set(name, Tag.setArticle(name, this));
		}
	}
	protected resolveUrl() {
		const { site, source } = getConfig();
		const formatter = site.articleUrlFormat;
		if (!formatter) {
			super.updateURL(URL.join(source.article, this.id, '/'));
			return;
		}
		super.updateURL(
			formatter({
				id: this.id,
				title: this.title,
				src: this.src,
				data: this.data!,
				date: this.#date,
			}),
		);
	}
	protected async update() {
		const result = await super.update();
		await hook('article:update', this);
		return result;
	}
	async getContent() {
		await hook('article:build:before', this);
		const result = await super.getContent();
		await hook('article:build:after', this);
		return result;
	}
	destroy(): void {
		super.destroy();
		articles.delete(this.filepath);
		hook('article:remove', this);
	}
}
