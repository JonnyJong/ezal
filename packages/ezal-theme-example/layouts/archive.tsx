import { Category, Tag, URL } from 'ezal';
import base from './base';
import ArchiveArticleList from './components/ArchiveArticleList';
import type { ArchivePageData } from './context';

const { page } = context;
const data = page.data as ArchivePageData;

function renderCategory(category: Category): JSX.Element {
	const children = category.children.values().toArray();
	return (
		<li>
			<a
				href={URL.for(`/category/${category.path.join('/')}/`)}
				data-size={category.getArticles().length}
			>
				{category.name}
			</a>
			{children.length === 0 ? null : <ul>{children.map(renderCategory)}</ul>}
		</li>
	);
}

function renderTag(tag: { name: string; size: number }): JSX.Element {
	return (
		<li>
			<a href={URL.for(`/tag/${tag.name}/`)} data-size={tag.size}>
				{tag.name}
			</a>
		</li>
	);
}

function renderYear([year, count]: [number, number]): JSX.Element {
	return (
		<li>
			<h3>
				{year}
				<sup>{count}</sup>
			</h3>
			<ArchiveArticleList articles={data.getArticles(year)} />
		</li>
	);
}

export default () => {
	const categories = Category.getAllRoot();

	const tags = Tag.getAll()
		.map((tag) => ({ name: tag.name, size: tag.getArticles().length }))
		.sort((a, b) => b.size - a.size)
		.map(renderTag);

	const years = data.years
		.entries()
		.toArray()
		.sort((a, b) => b[0] - a[0])
		.map(renderYear);

	return base(
		<header>
			<div class="wrap">
				<h1>归档{'year' in data ? `：${data.year}` : ''}</h1>
			</div>
		</header>,
		<main>
			<h2>
				分类<sup>{categories.length}</sup>
			</h2>
			<ul class="categories">{categories.map(renderCategory)}</ul>
			<h2>
				标签<sup>{tags.length}</sup>
			</h2>
			<ul class="tags">{tags}</ul>
			<h2>
				归档<sup>{data.years.size}</sup>
			</h2>
			<ul>{years}</ul>
		</main>,
	);
};
