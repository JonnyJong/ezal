import { URL } from 'ezal';
import base from './base';
import Article from './components/Article';
import Contact from './components/Contact';
import type { HomePage } from './context';

const { home } = context.theme;
const page = context.page as HomePage;
const pages = page.data.getPages();
const current = pages.indexOf(page);

const slogan = home?.slogan ? (
	<RawHTML html={home.slogan} />
) : (
	<>
		{'Hi there!👋'}
		<br />
		{`I'm ${context.site.author}.`}
	</>
);

const logo = home?.logo ? (
	<svg
		class="home-logo"
		viewBox={home.logo.viewBox}
		role="img"
		aria-label="logo"
	>
		<g id="logo">
			<RawHTML html={home.logo.g} />
		</g>
	</svg>
) : null;

let header: JSX.Element;
if (current) {
	header = <header style={{ height: 70 }} />;
} else {
	header = (
		<header>
			<div class="wrap home">
				<div class="home-title">
					{slogan}
					<Contact style={{ paddingTop: 8 }} />
				</div>
				{logo}
			</div>
			<div class="home-indicator icon-down"></div>
		</header>
	);
}

const pagination = pages.map((p, i) => {
	if (p === page) return <div class="page rounded">{i + 1}</div>;
	return (
		<a class="page rounded" href={`${URL.for(p.url)}#posts`}>
			{i + 1}
		</a>
	);
});

export default base(
	header,
	<main>
		<div class="wrap">
			<div class="article-list" id="posts">
				{page.data.getArticles(page.data.index).map((article) => (
					<Article article={article} />
				))}
			</div>
			{pagination.length > 1 ? <div class="pages">{pagination}</div> : null}
		</div>
	</main>,
);
