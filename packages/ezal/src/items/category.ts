import { hook } from '../hooks';
import { Queue } from '../utils/queue';
import type { Article } from './article';

const root = new Map<string, Category>();

export class Category {
	/** 获取所有根分类 */
	static getAllRoot(): Category[] {
		return root.values().toArray();
	}
	/** 获取所有分类 */
	static getAll(): Category[] {
		const result: Category[] = [];
		const stack: Category[] = root.values().toArray();
		while (true) {
			const node = stack.pop();
			if (!node) break;
			result.push(node);
			stack.push(...node.#children.values());
		}
		return result;
	}
	/** 从路径获取分类 */
	static get(path: string[]): Category | undefined {
		let category: Category | undefined;
		for (const name of path) {
			if (category) category = category.#children.get(name);
			else category = root.get(name);
			if (!category) return;
		}
		return category;
	}
	/** 设置文章分类 */
	static setArticle(path: string[], article: Article): Category {
		let category: Category | undefined;
		for (let i = 0; i < path.length; i++) {
			let cate: Category | undefined;
			const name = path[i];
			if (category) cate = category.#children.get(name);
			else cate = root.get(name);
			if (!cate) {
				cate = new Category(name, Object.freeze(path.slice(0, i + 1)));
				cate.#parent = category;
				hook('category:add', cate);
			}
			if (category) category.#children.set(name, cate);
			else root.set(name, cate);
			category = cate;
		}
		category!.#articles.add(article);
		hook('category:update', category!);
		return category!;
	}
	/** 移除文章分类 */
	static removeArticle(path: string[], article: Article) {
		Category.get(path)?.removeArticle(article);
	}
	#name: string;
	#path: readonly string[];
	#parent?: Category;
	#children = new Map<string, Category>();
	#articles = new Set<Article>();
	constructor(name: string, path: readonly string[]) {
		this.#name = name;
		this.#path = path;
	}
	/** 分类名称 */
	get name() {
		return this.#name;
	}
	/** 分类路径 */
	get path() {
		return this.#path;
	}
	/** 父分类 */
	get parent() {
		return this.#parent;
	}
	/** 子分类 */
	get children() {
		return this.#children;
	}
	/** 获取分类直属文章 */
	getArticles(): Article[] {
		return this.#articles.values().toArray();
	}
	/** 获取该分类下所有文章 */
	getAllArticles(): Article[] {
		const articles: Article[] = [];
		const queue = new Queue<Category>();
		queue.enqueue(this);
		for (const category of queue) {
			articles.push(...category.#articles);
			for (const child of category.#children.values()) {
				queue.enqueue(child);
			}
		}
		return new Set(articles).values().toArray();
	}
	/** 从该分类移除文章 */
	removeArticle(article: Article) {
		this.#articles.delete(article);
		hook('category:update', this);
		let category: Category = this;
		while (category.#articles.size === 0 && category.#children.size === 0) {
			if (!category.#parent) {
				root.delete(category.name);
				hook('category:remove', category);
				return;
			}
			category.#parent.children.delete(category.#name);
			hook('category:remove', category);
			category = category.#parent;
		}
	}
	/** 检查分类路径 */
	isPath(path: string[]): boolean {
		if (this.#path.length !== path.length) return false;
		return this.#path.every((name, index) => name === path[index]);
	}
	/** 分类是否被销毁 */
	get destroyed(): boolean {
		return !this.#parent && root.get(this.#name) !== this;
	}
}
