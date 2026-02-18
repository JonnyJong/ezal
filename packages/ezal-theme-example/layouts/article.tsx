import { Temporal } from '@js-temporal/polyfill';
import { Article, Time, URL } from 'ezal';
import type { Context } from 'ezal-markdown';
import base from './base';
import Image from './components/Image';

const { theme } = context;
const page = context.page as Article;
const markdown = page.renderedData as Context;

const categories = [
	...page.categories.values().map((cate) => (
		<a
			class="link"
			href={URL.for(URL.encode(`/category/${cate.path.join('/')}/`))}
		>
			{cate.path.join('/')}
		</a>
	)),
];

const tags = [
	...page.tags.keys().map((tag) => (
		<a class="link tag" href={URL.for(URL.encode(`/tag/${tag}/`))}>
			{tag}
		</a>
	)),
];

const date = page.date.toPlainDate().toString();
const dateTime = page.date.toString({ timeZoneName: 'never' });
const update = page.updated.toPlainDate().toString();
const updatedTime = page.updated.toString({ timeZoneName: 'never' });

const toc = <aside />;
let current = toc;
let currentLevel = 0;
for (const item of markdown.toc.values()) {
	const el = (
		<li>
			<a href={`#${item.anchor}`}>{item.name}</a>
		</li>
	);
	if (currentLevel < item.level) {
		const next = <ol />;
		next.append(el);
		current.append(next);
		if (current === toc) next.attr.class = 'toc';
	} else if (currentLevel === item.level) {
		current.after(el);
	} else {
		while (currentLevel > item.level) {
			current = current.parent.parent;
			currentLevel--;
		}
		current.after(el);
	}
	current = el;
	currentLevel = item.level;
}

const articles = Article.getAll().sort(context.compareByDate);
const index = articles.indexOf(page);
const prev: Article | undefined = articles[index - 1];
const next: Article | undefined = articles[index + 1];

/* const relatedMap = new Map<Article, number>();
for (const tag of page.tags.values()) {
	for (const article of tag.getArticles()) {
		if (article === page) continue;
		const count = relatedMap.get(article);
		relatedMap.set(article, (count ?? 0) + 1);
	}
}
const related = relatedMap
	.entries()
	.toArray()
	.sort(([_, a], [__, b]) => b - a)
	.slice(0, 6)
	.map(([a]) => a);

const relatedElements: JSX.Element[] = [];
if (related.length > 0) {
	relatedElements.push(<h2 class="related-title wrap">相关推荐</h2>);
	relatedElements.push(
		<div class="related wrap">
			{related.map((article) => (
				<a href={article.url}>{article.title}</a>
			))}
		</div>,
	);
} */

let outdateTemplate: JSX.Element | undefined;
if (page.data.outdate) {
	const outdate = Time.parseDate(page.data.outdate.date, page.updated);
	if (outdate) {
		const outdated =
			outdate.epochMilliseconds <=
			Temporal.Now.zonedDateTimeISO().epochMilliseconds;
		const classList = ['article-outdate'];
		if (outdated) classList.push('article-outdate-show');
		const time = outdate.toString({ timeZoneName: 'never' });
		outdateTemplate = (
			<div class={classList} data-time={time}>
				{page.data.outdate.message}
			</div>
		);
	}
}

export default base(
	<header>
		{page.data.cover ? <Image url={page.data.cover} alt={page.title} /> : null}
		<div class="wrap">
			<div class="cates">
				{categories}
				{tags}
			</div>
			<h1>{page.title}</h1>
			<div class="article-info">
				<span class="icon-word-count" title="字数">
					{markdown.counter.value}
				</span>
				<span class="icon-timer" title="预计阅读时长">
					~{markdown.counter.minute2read().toFixed(0)} 分钟
				</span>
				<time class="icon-date" title="发布日期" datetime={dateTime}>
					{date}
				</time>
				<time class="icon-updated" title="更新日期" datetime={updatedTime}>
					{update}
				</time>
				{theme.waline?.pageview && page.data?.comment !== false ? (
					<span class="icon-hot waline-pageview-count" title="阅读量">
						...
					</span>
				) : null}
			</div>
		</div>
	</header>,
	<main>
		{toc}
		<article>
			{outdateTemplate}
			<RawHTML html={page.content} />
		</article>
	</main>,
	// ...relatedElements,
	<div class="pagination wrap rounded">
		{prev ? (
			<a href={URL.for(prev.url)} class="prev">
				<i class="icon-left"></i>
				{prev.title}
			</a>
		) : null}
		<div class="flex"></div>
		{next ? (
			<a href={URL.for(next.url)} class="next">
				{next.title}
				<i class="icon-right"></i>
			</a>
		) : null}
	</div>,
);
