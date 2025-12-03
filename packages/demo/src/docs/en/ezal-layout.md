---
title: ezal-layout
date: 2025/11/23 12:10:01
updated: 2025/11/23
category: Documentation
tag: Documentation
---

ezal-layout is a simple HTML template engine that supports using JSX and TSX as HTML template languages, allowing you to write type-safe HTML templates with the advantages of TSX types.

In the template, you can access page data, site configuration, and other information through a custom `context` object:

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

## Core Components

ezal-layout provides several special core components:

### Doc
The `Doc` component is used to create the root element of an HTML document. It generates the `<!DOCTYPE html>` and `<html>` tags and is typically used as the root element of the page.

```tsx
export default () => (
  <Doc lang="zh-CN">
    <head>
      <meta charset="utf-8" />
      <title>Page Title</title>
    </head>
    <body>
      <h1>Page Content</h1>
    </body>
  </Doc>
);
```

### RawHTML
The `RawHTML` component is used to insert raw HTML strings without escaping the content. This component has no child elements.

```tsx
// Insert raw HTML content
<RawHTML html={content} />

// Use raw HTML in a script
<script type="module" defer>
  <RawHTML html={scriptContent} />
</script>
```

### Container
The `Container` component is a container element used to organize content without generating additional HTML tags.

```tsx
<Container>
  <div>Content 1</div>
  <div>Content 2</div>
</Container>
```

## Context Object

In the template, you can access data passed in from external sources and global configuration information through the `context` object. This is typically achieved by defining a `context.d.ts` file and setting global types.

To get type support in the template, you need to create a type declaration file, for example, `context.d.ts`:

```ts
// context.d.ts
import type { SiteConfig, ThemeConfig } from 'ezal';
import type { Page, Article } from 'ezal';

export interface Context {
  site: SiteConfig;
  theme: ThemeConfig;
  page: Page | Article;
  // Add other required properties
}

declare global {
  const context: Context;
}
```

And reference it in tsconfig.json:

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

This way, you can get a type-safe `context` object in the template:

```tsx
// Access context in the template
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

### External Modules

When compiling a template, you can pass in external modules via the `external` parameter. These modules can be accessed in the template through the parameter form:

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

// Use in the template
const { mime, URL } = context;
```

## Practical Application Example

Here is a practical example used in an ezal theme:

### Basic Layout Template

```tsx
// base.tsx - Basic layout
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

### Article Page Layout

```tsx
// article.tsx - Article page layout
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
      <div>Categories: {categories}</div>
      <div>Tags: {tags}</div>
    </section>
  </main>,
);
```

### Page Using Components

```tsx
// page.tsx - Generic page layout
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

## Compilation and Rendering

Use the `compile` function to compile the template file, then use the returned renderer to generate HTML:

```ts
import { compile } from 'ezal-layout';

// Compile the template file
const { renderer, dependencies } = await compile(
  'path/to/layout.tsx',
  {
    // External dependency modules
    'mime-types': require('mime-types'),
    'ezal': require('ezal'),
    '@js-temporal/polyfill': require('@js-temporal/polyfill'),
  },
);

// Render the page content
const html = await renderer({
  // Page context data
  page: {
    title: 'Page Title',
    content: '<p>Page content</p>',
    url: '/page-url/',
  },
  site: {
    title: 'Site Name',
    author: 'Author Name',
    domain: 'https://example.com',
  },
  theme: {
    // Theme configuration
  }
});
```
