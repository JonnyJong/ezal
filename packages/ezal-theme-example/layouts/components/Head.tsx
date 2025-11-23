import { URL } from 'ezal';
import * as mime from 'mime-types';

const { site, page, theme } = context;

function resolveFavicons(): [type: string, href: string][] {
	if (!theme.favicon) return [];
	let icons = theme.favicon;
	if (!Array.isArray(icons)) icons = [icons];
	return icons.map(String).map<[string, string]>((href) => {
		const type = mime.lookup(href);
		return [type ? type : '', href];
	});
}

const favicons = resolveFavicons();
const title =
	page.title && page.layout !== 'home'
		? `${page.title} - ${site.title}`
		: site.title;
const description = page.description ?? site.description;
const keywords = (page.keywords ?? site.keywords ?? []).join(',');
const canonicalUrl = URL.full(page.url);
const cover = page.data.cover ? URL.full(page.url, page.data.cover) : undefined;

const katex =
	theme.cdn?.katex ?? 'https://unpkg.com/katex@0.16.21/dist/katex.min.css';

const enableComment =
	theme.waline &&
	(page.data?.comment || ('tags' in page && page.data?.comment !== false));
const waline =
	theme.cdn?.walineCSS ?? 'https://unpkg.com/@waline/client@v3/dist/waline.css';

export default (slot?: any) => (
	<head>
		{/* 基本 */}
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<link rel="canonical" href={canonicalUrl} />
		{favicons.map(([type, href]) => (
			<link rel="icon" type={type} href={URL.full(href)} />
		))}
		<title>{title}</title>
		<link rel="sitemap" href={URL.full('sitemap.xml')} />
		<link
			rel="alternate"
			type="application/atom+xml"
			title={site.title}
			href={URL.full('atom.xml')}
		/>
		<link
			rel="alternate"
			type="application/rss+xml"
			title={site.title}
			href={URL.full('rss.xml')}
		/>
		<link
			rel="alternate"
			type="application/feed+json"
			title={site.title}
			href={URL.full('feed.json')}
		/>
		<meta name="theme-color" content="dark light" />
		<meta name="author" content={site.author} />
		{description ? <meta name="description" content={description} /> : null}
		{keywords ? <meta name="keywords" content={keywords} /> : null}
		{/* Open Graph */}
		<meta property="og:site_name" content={site.title} />
		<meta property="og:title" content={title} />
		{cover ? <meta property="og:image" content={cover} /> : null}
		<meta property="og:url" content={canonicalUrl} />
		<meta property="og:locale" content={site.language} />
		{favicons[0] ? (
			<meta property="og:image" content={URL.full(favicons[0][1])} />
		) : null}
		<meta
			property="og:type"
			content={page.layout === 'article' ? 'article' : 'website'}
		/>
		{/* Twitter */}
		<meta name="twitter:card" content="card" />
		<meta name="twitter:author" content={site.author} />
		<meta name="twitter:title" content={title} />
		<meta name="twitter:description" content={description} />
		{cover ? <meta name="twitter:image" content={cover} /> : null}
		{'tags' in page
			? [
					<meta name="twitter:tag" content={page.tags.keys().toArray().join(',')} />,
					<meta name="twitter:published_time" content={page.date.toString()} />,
					<meta name="twitter:modified_time" content={page.updated.toString()} />,
				]
			: null}
		{/* 资源 */}
		{'renderedData' in page && page.renderedData.shared.tex ? (
			<link rel="stylesheet" href={URL.for(katex)} />
		) : null}
		{enableComment ? <link rel="stylesheet" href={URL.for(waline)} /> : null}
		<link
			rel="preload"
			href="https://unpkg.com/@fontsource/maple-mono@5.2.4/files/maple-mono-latin-400-normal.woff2"
			as="font"
			type="font/woff2"
			crossorigin
		/>
		<link
			rel="preload"
			href="https://unpkg.com/@fontsource/maple-mono@5.2.4/files/maple-mono-latin-400-normal.woff"
			as="font"
			type="font/woff"
			crossorigin
		/>
		<link rel="stylesheet" href={URL.for(`styles/${page.layout}.css`)} />
		<script src={URL.for(`scripts/${page.layout}.js`)} async defer></script>
		{'renderedData' in page && page.renderedData.shared.codeblock ? (
			<link rel="stylesheet" href={URL.for('styles/code.css')} />
		) : null}
		{/* 额外 */}
		{slot}
		{theme.inject ? <RawHTML html={theme.inject} /> : null}
	</head>
);
