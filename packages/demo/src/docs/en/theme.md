---
title: Theme
date: 2025/11/23 12:20:01
updated: 2025/11/23
category: Documentation
tag: Documentation
---

# Configuration
```ts
import { defineConfig } from 'ezal';
import { theme } from 'ezal-theme-example';
import { Temporal } from '@js-temporal/polyfill';

export default defineConfig({
  // Other configurations are ignored
	theme: await theme({
		favicon: ['/favicon.svg'],
		nav: [
			{ name: 'Home', link: '/' },
			{ name: 'Archive', link: '/archive/' },
			{ name: 'Links', link: '/links/' },
			{ name: 'About', link: '/about/' },
		],
		since: Temporal.ZonedDateTime.from({
			year: 2025,
			month: 11,
			day: 8,
			hour: 21,
			minute: 40,
			second: 0,
			timeZone: 'Asia/Shanghai',
		}),
		contact: [
			{
				color: '#444',
				icon: 'github',
				name: 'Github',
				url: 'https://github.com/JonnyJong/ezal',
			},
			{
				color: '#d67c00',
				icon: 'rss',
				name: 'Atom',
				url: '/atom.xml',
			},
		],
		links: [
			{
				title: 'Links',
				description: 'Blog example',
				items: [
					{
						name: `Jonny's Blog`,
						description: 'Welcome to my little site',
						link: 'https://jonnys.top/',
						avatar: 'https://jonnys.top/img/avatar.svg',
						color: '#00AA00',
					},
				],
			},
		],
		inject: '<link rel="stylesheet" href="/icon/index.css">',
		home: {
			slogan: 'Welcome!👋<br>Here is the demo site of ezal blog framework.',
		},
	}),
});
```

# Features

## Search
Implemented based on [pagefind](https://github.com/pagefind/pagefind), it indexes all articles by default and does not index regular pages.\
To disable indexing for a specific article, add `index: false` to its frontmatter;\
To enable indexing for a regular page, add `index: true` to its frontmatter.

This feature will generate the following files:
- `/fragment/*`
- `/index/*`
- `/pagefind*`
- `/wasm.unknown.pagefind`

## RSS, Atom
Implemented based on [feed](https://github.com/jpmonette/feed), it includes all articles and categories.

This feature will generate the following files:
- `/rss.xml`
- `/atom.xml`
- `/feed.json`

## Sitemap
Implemented based on [sitemap](https://github.com/ekalinin/sitemap.js), it indexes all articles and the homepage by default, and does not index regular pages.\
To disable indexing for a specific article, add `sitemap: false` to its frontmatter;\
To enable indexing for a regular page, add `sitemap: true` to its frontmatter.

This feature will generate the following files:
- `/sitemap.xml`

## IndexNow
The theme integrates IndexNow, which can be used after configuring the key.

It indexes all articles and the homepage by default, and does not index regular pages.\
To disable indexing for a specific article, add `robots: false` to its frontmatter;\
To enable indexing for a regular page, add `robots: true` to its frontmatter.

```ts
import { defineConfig } from 'ezal';
import { theme } from 'ezal-theme-example';

export default defineConfig({
  // Other configurations are ignored
	theme: await theme({
    indexNow: {
      bing: 'your_bing_key', // Bing IndexNow key
      yandex: 'your_yandex_key', // Yandex IndexNow key
    },
	}),
});
```

## Waline
The theme integrates [Waline](https://waline.js.org), which can be enabled after adding the server URL configuration:
```ts
import { defineConfig } from 'ezal';
import { theme } from 'ezal-theme-example';

export default defineConfig({
  // Other configurations are ignored
	theme: await theme({
    waline: {
      serverUrl: 'https://example.com',
      visitor: true, // Enable visitor count
      commentCount: true, // Enable comment count display
      pageview: true, // Enable page view count
      emoji: ['https://cdn.jsdelivr.net/gh/walinejs/emojis@1.0.0/weibo'], // Custom emoji set
      reaction: ['https://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/60/2018new_grinninga_org.png'], // Reaction emoji
    },
	}),
});
```

## Image Optimization
The theme supports automatic image optimization, automatically converting images to multiple formats for optimal performance.

Supported input formats:
- `.jpeg`, `.jpg`, `.png`, `.gif`, `.webp`, `.svg`, `.tiff`, `.tif`, `.avif`, `.heif`, `.jxl`

Default optimization rules:
- `.jpeg`/`.jpg` → `.avif`, `.webp`, `.jxl`, `.jpg`
- `.png` → `.avif`, `.webp`, `.png`
- `.webp` → `.avif`, `.webp`, `.png`
- `.avif` → `.avif`, `.webp`, `.png`

```ts
import { defineConfig } from 'ezal';
import { theme } from 'ezal-theme-example';

export default defineConfig({
  theme: await theme({
    imageCache: {
      // Image metadata cache path
      metadata: './image-metadata.sqlite',
      // Optimized image cache path
      optimized: './cache',
    }
  }),
});
```

# Detailed Theme Configuration Options

## Navigation Bar Configuration
```ts
nav: [
  { name: 'Home', link: '/' },
  { name: 'Archive', link: '/archive/' },
  { name: 'Links', link: '/links/' },
  { name: 'About', link: '/about/' },
]
```

## Color Configuration
```ts
color: {
  light: '#006000', // Light theme color
  dark: '#00BB00',  // Dark theme color
}
```

## Markdown Options
```ts
markdown: {
  lineBreak: 'common-mark', // 'common-mark' | 'soft'
  codeBlockTheme: {
    light: 'light-plus',     // Light code theme
    dark: 'dark-plus'        // Dark code theme
  }
}
```

## Homepage Settings
```ts
home: {
  articlesPrePage: 10,       // Number of articles per page
  logo: {
    viewBox: '0 0 100 100',  // SVG logo's viewBox
    g: '<path d="..."/>',    // SVG logo's path definition,
  },
  slogan: 'Welcome to my blog', // Homepage slogan
}
```

## Links Page Styles
You can customize the styles enabled for the links page:

```ts
linkPageStyles: [
  'image',   // Enable image style
  'table',   // Enable table style
  'heading', // Enable heading style
  'list',    // Enable list style
  'footnote',// Enable footnote style
  'tabs',    // Enable tab style
  'note',    // Enable note style
  'fold',    // Enable fold style
  'kbd',     // Enable keyboard label style
]
```

## CDN Configuration
You can customize the CDN URLs for external resources:

```ts
cdn: {
  katex: 'https://example.com/katex.min.css',     // KaTeX stylesheet
  walineCSS: 'https://example.com/waline.css',   // Waline stylesheet
  walineJS: 'https://example.com/waline.js',     // Waline script file,
}
```

## Custom HTML Injection
You can inject custom content into the `<head>` of the page:

```ts
inject: '<link rel="stylesheet" href="/icon/index.css">'
```

# Page Types
The theme supports the following page types:

- **Homepage (home)**: The blog homepage, displaying a list of articles
- **Article page (article)**: The detail page for a blog article
- **Archive page (archive)**: A list of articles archived by year
- **Category page (category)**: A list of articles displayed by category
- **Tag page (tag)**: A list of articles displayed by tag
- **Links page (links)**: A page for friendly links
- **Regular page (page)**: Other pages besides the types listed above
- **404 page (404)**: An error page for when a page does not exist
