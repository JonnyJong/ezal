import { Article, VirtualPage } from 'ezal';
import type { HomePage, HomePageData } from '../../layouts/context';
import { getThemeConfig } from '../config';
import { compareByDate } from '../utils';

const pages: HomePage[] = [];

function getArticles(index: number): Article[] {
	const pre = getThemeConfig().home?.articlesPrePage ?? 10;
	const offset = index * pre;
	return Article.getAll()
		.toSorted(compareByDate)
		.slice(offset, offset + pre);
}

function getPages() {
	return pages;
}

function createPage(index: number): HomePage {
	const i = String(index + 1);
	const data: HomePageData = { index, getPages, getArticles };
	return new VirtualPage({
		id: index ? `${i}/` : '',
		src: `/${index ? `${i}/` : ''}`,
		layout: 'home',
		data,
	}) as HomePage;
}

let scanned = false;
export function updateHomePage(article?: Article) {
	if (!scanned && article) return;
	scanned = true;
	const pre = getThemeConfig().home?.articlesPrePage ?? 10;
	const count = Math.ceil(Math.max(Article.getAll().length / pre, 1));
	if (count > pages.length) {
		for (let i = pages.length; i < count; i++) {
			pages.push(createPage(i));
		}
	} else if (count < pages.length) {
		for (const page of pages.splice(count)) {
			page.destroy();
		}
	}
	for (const page of pages) {
		page.invalidated();
	}
}
