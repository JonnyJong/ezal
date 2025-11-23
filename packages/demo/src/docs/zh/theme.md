---
title: 主题
date: 2025/11/23 12:00:02
updated: 2025/11/23
category: 文档
tag: 文档
---

# 配置
```ts
import { defineConfig } from 'ezal';
import { theme } from 'ezal-theme-example';
import { Temporal } from '@js-temporal/polyfill';

export default defineConfig({
  // 其他配置忽略
	theme: await theme({
		favicon: ['/favicon.svg'],
		nav: [
			{ name: '首页', link: '/' },
			{ name: '归档', link: '/archive/' },
			{ name: '链接', link: '/links/' },
			{ name: '关于', link: '/about/' },
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
				title: '链接',
				description: '博客示例',
				items: [
					{
						name: `Jonny's Blog`,
						description: '欢迎光临小站',
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

# 功能

## 搜索
基于 [pagefind](https://github.com/pagefind/pagefind) 实现，默认索引所有文章，不索引普通页面。\
若要禁用某篇文章的索引，需在文章 frontmatter 中添加 `index: false`；\
若要为某个普通页面启用索引，存在页面 frontmatter 中添加 `index: true`。

此功能将产生以下文件：
- `/fragment/*`
- `/index/*`
- `/pagefind*`
- `/wasm.unknown.pagefind`

## RSS、Atom
基于 [feed](https://github.com/jpmonette/feed) 实现，包含所有文章和分类。

此功能将产生以下文件：
- `/rss.xml`
- `/atom.xml`
- `/feed.json`

## 站点地图
基于 [sitemap](https://github.com/ekalinin/sitemap.js) 实现，默认索引所有文章和主页，不索引普通页面。\
若要禁用某篇文章的索引，需在文章 frontmatter 中添加 `sitemap: false`；\
若要为某个普通页面启用索引，存在页面 frontmatter 中添加 `sitemap: true`。

此功能将产生以下文件：
- `/sitemap.xml`

## IndexNow
主题集成了 IndexNow，配置密钥后即可使用。

默认索引所有文章和主页，不索引普通页面。\
若要禁用某篇文章的索引，需在文章 frontmatter 中添加 `robots: false`；\
若要为某个普通页面启用索引，存在页面 frontmatter 中添加 `robots: true`。

```ts
import { defineConfig } from 'ezal';
import { theme } from 'ezal-theme-example';

export default defineConfig({
  // 其他配置忽略
	theme: await theme({
    indexNow: {
      bing: 'your_bing_key', // Bing IndexNow 密钥
      yandex: 'your_yandex_key', // Yandex IndexNow 密钥
    },
	}),
});
```

## Waline
主题集成了 [Waline](https://waline.js.org)，添加服务器链接配置后即可启用：
```ts
import { defineConfig } from 'ezal';
import { theme } from 'ezal-theme-example';

export default defineConfig({
  // 其他配置忽略
	theme: await theme({
    waline: {
      serverUrl: 'https://example.com',
      visitor: true, // 启用访问量统计
      commentCount: true, // 启用评论数显示
      pageview: true, // 启用页面浏览量统计
      emoji: ['https://cdn.jsdelivr.net/gh/walinejs/emojis@1.0.0/weibo'], // 自定义表情包
      reaction: ['https://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/60/2018new_grinninga_org.png'], // 反应表情
    },
	}),
});
```

## 图像优化
主题支持自动图像优化，可自动将图像转换为多种格式以提供最佳性能。

支持的输入格式：
- `.jpeg`, `.jpg`, `.png`, `.gif`, `.webp`, `.svg`, `.tiff`, `.tif`, `.avif`, `.heif`, `.jxl`

默认优化规则：
- `.jpeg`/.`jpg` → `.avif`, `.webp`, `.jxl`, `.jpg`
- `.png` → `.avif`, `.webp`, `.png`
- `.webp` → `.avif`, `.webp`, `.png`
- `.avif` → `.avif`, `.webp`, `.png`

```ts
import { defineConfig } from 'ezal';
import { theme } from 'ezal-theme-example';

export default defineConfig({
  theme: await theme({
    imageCache: {
      // 图像元数据缓存路径
      metadata: './image-metadata.sqlite',
      // 优化版图像缓存路径
      optimized: './cache',
    }
  }),
});
```

# 主题配置选项详解

## 导航栏配置
```ts
nav: [
  { name: '首页', link: '/' },
  { name: '归档', link: '/archive/' },
  { name: '链接', link: '/links/' },
  { name: '关于', link: '/about/' },
]
```

## 颜色配置
```ts
color: {
  light: '#006000', // 浅色主题色
  dark: '#00BB00',  // 深色主题色
}
```

## Markdown 选项
```ts
markdown: {
  lineBreak: 'common-mark', // 'common-mark' | 'soft'
  codeBlockTheme: {
    light: 'light-plus',     // 浅色代码主题
    dark: 'dark-plus'        // 深色代码主题
  }
}
```

## 主页设置
```ts
home: {
  articlesPrePage: 10,       // 每页文章数量
  logo: {
    viewBox: '0 0 100 100',  // SVG logo 的 viewBox
    g: '<path d="..."/>',    // SVG logo 的路径定义
  },
  slogan: '欢迎来到我的博客', // 主页标语
}
```

## 友情链接页面样式
可以自定义友情链接页面启用的样式：

```ts
linkPageStyles: [
  'image',   // 启用图像样式
  'table',   // 启用表格样式
  'heading', // 启用标题样式
  'list',    // 启用列表样式
  'footnote',// 启用脚注样式
  'tabs',    // 启用选项卡样式
  'note',    // 启用注释样式
  'fold',    // 启用折叠样式
  'kbd',     // 启用键盘标签样式
]
```

## CDN 配置
可以自定义外部资源的 CDN 地址：

```ts
cdn: {
  katex: 'https://example.com/katex.min.css',     // KaTeX 样式文件
  walineCSS: 'https://example.com/waline.css',   // Waline 样式文件
  walineJS: 'https://example.com/waline.js',     // Waline 脚本文件
}
```

## 自定义 HTML 注入
可以在页面的 `<head>` 中注入自定义内容：

```ts
inject: '<link rel="stylesheet" href="/icon/index.css">'
```

# 页面类型
主题支持以下页面：

- **主页 (home)**: 博客首页，显示文章列表
- **文章页 (article)**: 博客文章详情页面
- **归档页 (archive)**: 按年份归档的文章列表
- **分类页 (category)**: 按分类显示的文章列表
- **标签页 (tag)**: 按标签显示的文章列表
- **链接页 (links)**: 友情链接页面
- **普通页面 (page)**: 除上述类型外的其他页面
- **404 页面 (404)**: 页面不存在时的错误页面
