import { Article, VirtualPage } from 'ezal';
import type { ArchivePage, ArchivePageData } from '../../layouts/context';
import { compareByDate } from '../utils';

let indexPage: ArchivePage;
const years = new Map<number, number>();

function getArticles(year: number): Article[] {
	return Article.getAll()
		.filter((article) => article.date.year === year)
		.toSorted(compareByDate);
}

function createIndex() {
	const data: ArchivePageData = { years, getArticles };
	indexPage = new VirtualPage({
		id: 'archive',
		src: '/archive/',
		layout: 'archive',
		title: '归档',
		data,
	}) as ArchivePage;
}

let scanned = false;
export function updateArchivePage(_any?: any) {
	if (!scanned && _any) return;
	scanned = true;
	if (!indexPage) createIndex();
	const newYears = new Map<number, number>();
	for (const article of Article.getAll()) {
		const year = article.date.year;
		let count = newYears.get(year);
		if (count === undefined) count = 0;
		count++;
		newYears.set(year, count);
	}
	years.clear();
	for (const [year, count] of newYears) {
		years.set(year, count);
	}
	indexPage.invalidated();
}
