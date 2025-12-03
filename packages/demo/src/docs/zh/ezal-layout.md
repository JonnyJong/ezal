---
title: ezal-layout
date: 2025/11/23 12:10:00
updated: 2025/11/23
category: 文档
tag: 文档
---

ezal-layout 是一个简易的 HTML 模版引擎，支持使用 JSX、TSX 作为 HTML 模版语言，可借助 TSX 的类型优势编写类型安全的 HTML 模版。

在模板中，可以通过自定义的 `context` 对象来访问页面数据、站点配置等信息：

```tsx
import { title } from 'external';

const { content } = context;

export default (content: string) => (
  <Doc>
    <head>
      <title>{title}</title>
    </head>
    <body><RawHTML html={content}/></body>
  </Doc>
);
```

```ts
import { compile } from 'ezal-layout';

const { renderer } = await compile(
  'path/to/template.tsx',
  { external: { title: 'Hello world!' } },
);

const html = await renderer('<h1>Title</h1>');
```

## 核心组件

ezal-layout 提供了几个特殊的核心组件：

### Doc
`Doc` 组件用于创建 HTML 文档的根元素，它会生成 `<!DOCTYPE html>` 和 `<html>` 标签。通常用作页面的根元素。

```tsx
export default () => (
  <Doc lang="zh-CN">
    <head>
      <meta charset="utf-8" />
      <title>页面标题</title>
    </head>
    <body>
      <h1>页面内容</h1>
    </body>
  </Doc>
);
```

### RawHTML
`RawHTML` 组件用于插入原始 HTML 字符串，不会对内容进行转义。这个组件没有子元素。

```tsx
// 插入原始 HTML 内容
<RawHTML html={content} />

// 在脚本中使用原始 HTML
<script type="module" defer>
  <RawHTML html={scriptContent} />
</script>
```

### Container
`Container` 组件是一个容器元素，用于在不生成额外 HTML 标签的情况下组织内容。

```tsx
<Container>
  <div>内容1</div>
  <div>内容2</div>
</Container>
```

## 上下文对象

在模板中，可以通过 `context` 对象访问外部传入的数据和全局配置信息。通常通过定义 `context.d.ts` 文件并设置全局类型来实现。

为了在模板中获得类型支持，需要创建一个类型声明文件，例如 `context.d.ts`：

```ts
// context.d.ts
import type { SiteConfig, ThemeConfig } from 'ezal';
import type { Page, Article } from 'ezal';

export interface Context {
  site: SiteConfig;
  theme: ThemeConfig;
  page: Page | Article;
  // 添加其他需要的属性
}

declare global {
  const context: Context;
}
```

并在 tsconfig.json 中引用：

```json
{
  "extends": "ezal-layout/tsconfig.base.json",
  "compilerOptions": {
    "types": ["ezal-layout/runtime.d.ts", "./context.d.ts"]
  },
  "include": [
    "./**/*",
    "ezal-layout/runtime.d.ts",
    "./context.d.ts"
  ]
}
```

这样在模板中就可以获得类型安全的 `context` 对象：

```tsx
// 在模板中访问 context
const { page, site, theme } = context;

export default () => (
  <Doc>
    <head>
      <title>{page.title} - {site.title}</title>
    </head>
    <body>
      <header>
        <h1>{site.title}</h1>
      </header>
      <main>
        <h2>{page.title}</h2>
        <div>{page.content}</div>
      </main>
    </body>
  </Doc>
);
```

### 外部模块

在编译模板时，可以通过 `external` 参数传入外部模块，这些模块可以在模板中通过形参传入：

```ts
import { compile } from 'ezal-layout';
import * as mime from 'mime-types';
import { URL } from 'ezal';

const { renderer } = await compile(
  'path/to/template.tsx',
  {
    'mime-types': mime,
    'ezal': { URL }
  },
);

// 在模板中使用
const { mime, URL } = context;
```

## 实际应用示例

以下是在 ezal 主题中使用的实际示例：

### 基础布局模板

```tsx
// base.tsx - 基础布局
import Footer from './components/Footer';
import Head from './components/Head';
import Nav from './components/Nav';

export default (...elements: JSX.Element[]) => (
  <Doc lang={context.site.language}>
    <head>
      <Head />
    </head>
    <body>
      <Nav />
      {elements}
      <Footer />
    </body>
  </Doc>
);
```

### 文章页面布局

```tsx
// article.tsx - 文章页面布局
import { Article } from 'ezal';
import base from './base';

const page = context.page as Article;

const categories = [
  ...page.categories.values().map((cate) => (
    <a class="link" href={context.URL.encode(`/category/${cate.path.join('/')}/`)}>
      {cate.path.join('/')}
    </a>
  )),
];

const tags = [
  ...page.tags.keys().map((tag) => (
    <a class="link tag" href={context.URL.encode(`/tag/${tag}/`)}>
      {tag}
    </a>
  )),
];

export default base(
  <header>
    <div class="wrap">
      <h1>{page.title}</h1>
      <time datetime={page.date.toString()}>{page.date.toPlainDate().toString()}</time>
    </div>
  </header>,
  <main>
    <article>
      <RawHTML html={page.content} />
    </article>

    <section class="meta">
      <div>分类: {categories}</div>
      <div>标签: {tags}</div>
    </section>
  </main>,
);
```

### 使用组件的页面

```tsx
// page.tsx - 通用页面布局
import base from './base';

const page = context.page;

export default base(
  <header>
    <div class="wrap">
      <h1>{page.title}</h1>
    </div>
  </header>,
  <main>
    <article>
      <RawHTML html={page.content} />
    </article>
  </main>,
);
```

## 编译和渲染

使用 `compile` 函数编译模板文件，然后使用返回的渲染器生成 HTML：

```ts
import { compile } from 'ezal-layout';

// 编译模板文件
const { renderer, dependencies } = await compile(
  'path/to/layout.tsx',
  {
    // 外部依赖模块
    'mime-types': require('mime-types'),
    'ezal': require('ezal'),
    '@js-temporal/polyfill': require('@js-temporal/polyfill'),
  },
);

// 渲染页面内容
const html = await renderer({
  // 页面上下文数据
  page: {
    title: '页面标题',
    content: '<p>页面内容</p>',
    url: '/page-url/',
  },
  site: {
    title: '站点名称',
    author: '作者姓名',
    domain: 'https://example.com',
  },
  theme: {
    // 主题配置
  }
});
```
