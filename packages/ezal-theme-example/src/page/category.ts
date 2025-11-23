import { Category, VirtualPage } from 'ezal';
import type { CategoryPage, CategoryPageData } from '../../layouts/context';

const categories = new Map<Category, CategoryPage>();

function createPage(category: Category): CategoryPage {
	const id = `category/${category.path.join('/')}`;
	const data: CategoryPageData = { category };
	return new VirtualPage({
		id,
		src: `/${id}/`,
		title: `分类：${category.name}`,
		layout: 'category',
		data,
	}) as CategoryPage;
}

let scanned = false;
export function updateCategoryPage(_any?: any) {
	if (!scanned && _any) return;
	scanned = true;
	for (const [category, page] of categories.entries().toArray()) {
		if (!category.destroyed) continue;
		page.destroy();
		categories.delete(category);
	}
	for (const category of Category.getAll()) {
		if (categories.has(category)) continue;
		categories.set(category, createPage(category));
	}
}
