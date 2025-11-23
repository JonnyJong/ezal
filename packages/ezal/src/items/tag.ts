import { hook } from '../hooks';
import type { Article } from './article';

const tags = new Map<string, Tag>();

export class Tag {
	/** 获取所有标签 */
	static getAll(): Tag[] {
		return tags.values().toArray();
	}
	/** 设置文章标签 */
	static setArticle(name: string, article: Article): Tag {
		let tag = tags.get(name);
		if (!tag) {
			tag = new Tag(name);
			tags.set(name, tag);
			hook('tag:add', tag);
		}
		tag.#articles.add(article);
		hook('tag:update', tag);
		return tag;
	}
	#name: string;
	#articles = new Set<Article>();
	constructor(name: string) {
		this.#name = name;
	}
	/** 标签名 */
	get name() {
		return this.#name;
	}
	/** 获取标签对应的所有文章 */
	getArticles(): Article[] {
		return this.#articles.values().toArray();
	}
	/** 从标签移除文章 */
	removeArticle(article: Article) {
		this.#articles.delete(article);
		hook('tag:update', this);
		if (this.#articles.size > 0) return;
		tags.delete(this.#name);
		hook('tag:remove', this);
	}
	/** 标签是否被销毁 */
	get destroyed(): boolean {
		return tags.get(this.#name) !== this;
	}
}
