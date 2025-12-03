---
title: Ezal Framework Usage and Development Guide
date: 2025/11/23 12:40:01
updated: 2025/11/23
category: Documentation
tag: Documentation
---

Ezal is a simple, asynchronous blog framework that provides a basic routing, dependency management, page rendering, and category and tag management framework, exposing the build lifecycle to themes through hooks. The Ezal framework does not provide Markdown and HTML template rendering functions, which must be handled by the theme itself.

# Usage Guide

This section mainly introduces how to use the Ezal framework to write and manage a blog.

## Project Initialization and Configuration

### Configuration File (ezal.config.ts)

Ezal uses `ezal.config.ts` as its main configuration file. Here is a complete configuration example:

```ts
import { Temporal } from '@js-temporal/polyfill';
import { defineConfig } from 'ezal';
import { theme } from 'ezal-theme-example';

export default defineConfig(async () => ({
  site: {
    title: 'Ezal Blog Framework',      // Site title
    author: 'Jonny',                   // Author
    language: 'zh',                    // Language
    domain: 'https://example.com',     // Site domain
    root: '/blog',                     // Site root path
    description: '我的个人博客',        // Site description
    keywords: ['技术', '博客', '前端'],  // SEO keywords
  },
  source: {
    root: 'src',                       // Source file root directory
    article: 'article',                // Article directory (relative to root)
  },
  outDir: 'dist',                      // Build output directory
  theme: await theme({                 // Theme configuration
    favicon: ['/favicon.svg'],         // Site favicon
    nav: [                             // Navigation bar
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
    }),                               // Site creation time
    contact: [                        // Contact information
      {
        color: '#444',
        icon: 'github',
        name: 'Github',
        url: 'https://github.com/username',
      },
    ],
    links: [                         // Friend links
      {
        title: '友情链接',
        description: '技术社区',
        items: [
          {
            name: 'Ezal Blog',
            description: 'Ezal framework official website',
            link: 'https://ezal.example.com',
            avatar: '/img/avatar.svg',
            color: '#00AA00',
          },
        ],
      },
    ],
    inject: '<link rel="stylesheet" href="/icon/index.css">', // Content injected into HTML head
    home: {
      slogan: '欢迎访问我的博客！',     // Homepage slogan
      articlesPrePage: 10,            // Number of articles displayed per page on the homepage
    },
    markdown: {
      lineBreak: 'common-mark',      // Line break rules
      codeBlockTheme: {              // Code block theme
        light: 'light-plus',
        dark: 'dark-plus'
      }
    }
  }),
  server: {                          // Development server configuration
    port: 9090,                      // Port number
    host: '0.0.0.0',                 // Listening address
    autoReload: true,                // Auto reload
  },
}));
```

## Blog Content Organization

### Directory Structure

The content organization for an Ezal blog is very flexible and can be adjusted through the following options in the configuration file:

- `source.root`: Source file root directory
- `source.article`: Article directory (relative to source.root)
- `site.articleUrlFormat`: Article URL formatting function
- `site.pageUrlFormat`: Page URL formatting function

This means you can freely organize your content structure, for example:

```
src/
├── article/
│   ├── post1.md
│   ├── post2.md
│   └── category/
│       └── post3.md
├── img/
├── about.md
└── links.md

# or other structures
content/
├── posts/
├── pages/
└── assets/
```

### Configuration File

Ezal uses the cosmiconfig library to read configuration, so the configuration file is not limited to `ezal.config.ts` and can also be:

- `ezal.config.ts` (recommended)
- `ezal.config.js`
- `.ezalrc.json`
- `.ezalrc.yaml`
- `.ezalrc` (JSON)
- `ezal` field in `package.json`

### Article Frontmatter

Each Markdown article must contain Frontmatter metadata at the beginning:

``````md
---
title: Article Title
date: 2025/11/23
updated: 2025/11/23
description: Article description
tags: [tag1, tag2, tag3]
categories: [category1, category2]
layout: article
---

Article body content...
``````

Supported Frontmatter fields:
- `title`: Article title
- `date`: Publication date (required)
- `updated`: Update date (optional)
- `description`: Article description
- `tags`: Array of tags
- `categories`: Array of categories (can be nested)
- `layout`: Layout name
- Other custom fields

## Command Line Tool

Ezal provides a command-line tool to manage the blog:

```bash
# Build static files
npx ezal build
# or use alias
npx ezal b

# Clean output directory
npx ezal clean

# Start development server
npx ezal serve
# or use alias
npx ezal s
```

Development server options:
- `--verbose`: Show verbose output

Build options:
- `--clean`: Clean the output directory before building
- `--dry-run`: Simulate the build process (do not write files)
- `--verbose`: Show verbose output

# Theme Development

This section mainly introduces how to develop themes for the Ezal framework.

## Theme Structure

The structure of an Ezal theme is very flexible, with the only hard requirement being the correct configuration of the entry point in its `package.json` so that users can import and use the theme function. Themes can freely organize their internal structure as long as the entry function correctly returns the following configuration:

- `assetsRoot`: Path to the assets root directory
- `transformRules`: Asset transformation rules
- `layout`: Layout configuration
- `pageHandlers`: Page handlers
- `hooks`: Hook functions

The specific organization structure of a theme can refer to the implementation of `@packages/ezal-theme-example`, but it is not mandatory. Themes can freely design the organization of their templates, resource files, and other components.

## Theme Configuration

The core of a theme is to return a configuration object containing the following properties, which can be defined in any file:

```ts
interface ThemeConfig {
  assetsRoot: string;           // Assets root directory (absolute path)
  transformRules?: TransformRule[];  // Transformation rules
  layout: LayoutConfig;         // Layout configuration
  pageHandlers: PageHandler[];  // Page handlers
  hooks?: HookOptions;          // Hooks
}
```

A typical theme will export an asynchronous function to generate the configuration:

```ts
import path from 'node:path';
import type { ThemeConfig as EzalThemeConfig } from 'ezal';

export async function theme(config?: ThemeConfigOptions): Promise<EzalThemeConfig> {
  // Process user-provided theme configuration
  return {
    assetsRoot: path.join(__dirname, '../assets'),  // Assets root directory
    transformRules: [styleTransformRule, scriptTransformRule],  // Asset transformation rules
    layout: layoutConfig,  // Layout configuration
    pageHandlers: [await markdownPageHandler()],  // Page handlers
    hooks: {  // Hook configuration
      'config:after': [initCodeblockStyle],
      'scan:after': [updateHomePage, updateArchivePage],
      'article:add': [updateHomePage, updateArchivePage],
      // ... more hooks
    },
  };
}
```

## Theme Configuration Interface

The theme function needs to return the `ThemeConfig` interface defined by the Ezal framework. For the specific definition, you can refer to `@packages/ezal/src/config.ts`:

```ts
export interface ThemeConfig {
  assetsRoot: string;           // Assets root directory (absolute path)
  transformRules?: TransformRule[];  // Transformation rules
  layout: LayoutConfig;         // Layout configuration
  pageHandlers: PageHandler[];  // Page handlers
  hooks?: HookOptions;          // Hooks
}
```

## Layout Template

Layout templates need to be configured by the theme itself. Refer to `@packages/ezal-theme-example/src/layout.ts`. The theme needs to select and configure an HTML template renderer and convert it into an interface supported by the Ezal framework. For the specific interface definition, refer to `@packages/ezal/src/items/layout.ts`.

The core of the layout template is the `LayoutConfig` interface, which includes:
- `root`: Absolute path to the layout file root directory
- `compiler`: Layout compiler, which compiles layout source files into a renderer

The layout compiler needs to return an object containing the following:
- `renderer`: Layout renderer, which receives a context and returns the rendering result
- `dependencies`: An array of file paths that the layout template depends on (optional)

## Page Handlers

Page handlers define the parsing and rendering rules for different file types:

```ts
interface PageHandler {
  exts: string | string[];  // Supported file extensions
  parser: (src: string) => Promise<{ content: string, data: Record<string, any> }>; // Parser
  renderer: (content: string, page: Page) => Promise<{ html: string, data: any }>; // Renderer
}
```

Example: Markdown Page Handler

```ts
export async function markdownPageHandler(): Promise<PageHandler> {
  return {
    exts: '.md',  // Handle .md files
    async parser(src) {
      const file = await fs.readFile(src);
      if (file instanceof Error) return file;
      const frontmatter = await extractFrontmatter(file);
      let data = frontmatter?.data as Record<string, any>;
      if (typeof data !== 'object') data = {};
      const content = file.slice(frontmatter?.raw.length ?? 0);
      return { content, data };
    },
    async renderer(content, page) {
      const result = await renderer.renderHTML(content, {
        lineBreak: config.markdown?.lineBreak,
        shared: { page } as any,
      });
      return {
        html: result.html,
        data: result.context,
      };
    },
  };
}
```

## Hooks

Ezal provides rich hooks to extend theme functionality:

### Build Lifecycle Hooks

- `config:after`: After configuration is loaded
- `scan:before`: Before scanning
- `scan:after`: After scanning
- `build:before`: Before building
- `build:after`: After building
- `preview:stop`: Preview stop

### Content Management Hooks

- `article:add`: Add article
- `article:update`: Update article
- `article:remove`: Remove article
- `article:build:before`: Before article build
- `article:build:after`: After article build
- `page:update`: Page update
- `page:remove`: Page remove
- `page:build:after`: After page build
- `category:add`: Add category
- `category:update`: Update category
- `category:remove`: Remove category
- `tag:add`: Add tag
- `tag:update`: Update tag
- `tag:remove`: Remove tag
- `asset:add`: Add asset
- `asset:update`: Update asset
- `asset:remove`: Remove asset

Example: Using hooks to update the archive page

```ts
hooks: {
  'article:add': [updateArchivePage],
  'article:update': [updateArchivePage],
  'article:remove': [updateArchivePage],
}
```

## Asset Transformation

Themes can define asset transformation rules to handle CSS, JS, and other resource files:

```ts
interface TransformRule {
  from: string;      // Source file extension
  to: string;        // Target file extension
  transform: (src: string, dest: string) => Promise<void>; // Transformation function
}
```

Example: Stylus to CSS transformation rule

```ts
export const styleTransformRule: TransformRule = {
  from: '.styl',
  to: '.css',
  async transform(src, dest) {
    const result = await stylus(await fs.readFile(src)).render();
    await fs.writeFile(dest, result);
  }
};
```
