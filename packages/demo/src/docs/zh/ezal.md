---
title: Ezal 框架使用与开发指南
date: 2025/11/23 12:40:00
updated: 2025/11/23
category: 文档
tag: 文档
---

Ezal 是一个简易的、异步的博客框架，其提供了基本的路由、依赖管理、页面渲染、分类和标签管理框架，并通过钩子将构建生命周期暴露给主题。Ezal 框架不提供 Markdown 和 HTML 模版渲染功能，需主题自行组合。

# 使用指南

本部分主要介绍如何使用 Ezal 框架来编写和管理博客。

## 项目初始化和配置

### 配置文件 (ezal.config.ts)

Ezal 使用 `ezal.config.ts` 作为主要配置文件。以下是一个完整的配置示例：

```ts
import { Temporal } from '@js-temporal/polyfill';
import { defineConfig } from 'ezal';
import { theme } from 'ezal-theme-example';

export default defineConfig(async () => ({
  site: {
    title: 'Ezal Blog Framework',      // 站点标题
    author: 'Jonny',                   // 作者
    language: 'zh',                    // 语言
    domain: 'https://example.com',     // 站点域名
    root: '/blog',                     // 站点根路径
    description: '我的个人博客',        // 站点描述
    keywords: ['技术', '博客', '前端'],  // SEO 关键词
  },
  source: {
    root: 'src',                       // 源文件根目录
    article: 'article',                // 文章目录 (相对于 root)
  },
  outDir: 'dist',                      // 构建输出目录
  theme: await theme({                 // 主题配置
    favicon: ['/favicon.svg'],         // 站点图标
    nav: [                             // 导航栏
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
    }),                               // 建站时间
    contact: [                        // 联系方式
      {
        color: '#444',
        icon: 'github',
        name: 'Github',
        url: 'https://github.com/username',
      },
    ],
    links: [                         // 友情链接
      {
        title: '友情链接',
        description: '技术社区',
        items: [
          {
            name: 'Ezal Blog',
            description: 'Ezal 框架官网',
            link: 'https://ezal.example.com',
            avatar: '/img/avatar.svg',
            color: '#00AA00',
          },
        ],
      },
    ],
    inject: '<link rel="stylesheet" href="/icon/index.css">', // 注入到 HTML 头部的内容
    home: {
      slogan: '欢迎访问我的博客！',     // 主页标语
      articlesPrePage: 10,            // 主页每页显示的文章数
    },
    markdown: {
      lineBreak: 'common-mark',      // 换行规则
      codeBlockTheme: {              // 代码块主题
        light: 'light-plus',
        dark: 'dark-plus'
      }
    }
  }),
  server: {                          // 开发服务器配置
    port: 9090,                      // 端口号
    host: '0.0.0.0',                 // 监听地址
    autoReload: true,                // 自动重载
  },
}));
```

## 博客内容组织

### 目录结构

Ezal 博客的内容组织非常灵活，可以通过配置文件中的以下选项进行调整：

- `source.root`: 源文件根目录
- `source.article`: 文章目录（相对于 source.root）
- `site.articleUrlFormat`: 文章链接格式化函数
- `site.pageUrlFormat`: 页面链接格式化函数

这意味着你可以自由组织你的内容结构，例如：

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

# 或其他结构
content/
├── posts/
├── pages/
└── assets/
```

### 配置文件

Ezal 使用 cosmiconfig 库来读取配置，因此配置文件不仅限于 `ezal.config.ts`，还可以是：

- `ezal.config.ts` (推荐)
- `ezal.config.js`
- `.ezalrc.json`
- `.ezalrc.yaml`
- `.ezalrc` (JSON)
- `package.json` 中的 `ezal` 字段

### 文章 Frontmatter

每篇 Markdown 文章的开头都需要包含 Frontmatter 元数据：

``````md
---
title: 文章标题
date: 2025/11/23
updated: 2025/11/23
description: 文章描述
tags: [标签1, 标签2, 标签3]
categories: [分类1, 分类2]
layout: article
---

文章正文内容...
``````

支持的 Frontmatter 字段：
- `title`: 文章标题
- `date`: 发布日期 (必填)
- `updated`: 更新日期 (可选)
- `description`: 文章描述
- `tags`: 标签数组
- `categories`: 分类数组 (可以是嵌套结构)
- `layout`: 布局名称
- 其他自定义字段

## 命令行工具

Ezal 提供了命令行工具来管理博客：

```bash
# 构建静态文件
npx ezal build
# 或使用别名
npx ezal b

# 清理输出目录
npx ezal clean

# 启动开发服务器
npx ezal serve
# 或使用别名
npx ezal s
```

开发服务器选项：
- `--verbose`: 显示详细输出

构建选项：
- `--clean`: 构建前清理输出目录
- `--dry-run`: 模拟构建过程（不写入文件）
- `--verbose`: 显示详细输出

# 主题开发

本部分主要介绍如何为 Ezal 框架开发主题。

## 主题结构

Ezal 主题的结构非常灵活，唯一的硬性要求是在其 `package.json` 中正确配置入口，以便用户可以导入和使用主题函数。主题可以自由组织其内部结构，只需要确保入口函数正确返回以下配置：

- `assetsRoot`: 资源根目录路径
- `transformRules`: 资源转换规则
- `layout`: 布局配置
- `pageHandlers`: 页面处理器
- `hooks`: 钩子函数

主题的具体组织结构可以参考 `@packages/ezal-theme-example` 的实现，但不是强制性的。主题可以自由设计其模版、资源文件和其他组件的组织方式。

## 主题配置

主题的核心是返回一个包含以下属性的配置对象，这个配置可以定义在任何文件中：

```ts
interface ThemeConfig {
  assetsRoot: string;           // 资源根目录（绝对路径）
  transformRules?: TransformRule[];  // 转换规则
  layout: LayoutConfig;         // 布局配置
  pageHandlers: PageHandler[];  // 页面处理器
  hooks?: HookOptions;          // 钩子
}
```

典型的主题会导出一个异步函数来生成配置：

```ts
import path from 'node:path';
import type { ThemeConfig as EzalThemeConfig } from 'ezal';

export async function theme(config?: ThemeConfigOptions): Promise<EzalThemeConfig> {
  // 处理用户传入的主题配置
  return {
    assetsRoot: path.join(__dirname, '../assets'),  // 资源根目录
    transformRules: [styleTransformRule, scriptTransformRule],  // 资源转换规则
    layout: layoutConfig,  // 布局配置
    pageHandlers: [await markdownPageHandler()],  // 页面处理器
    hooks: {  // 钩子配置
      'config:after': [initCodeblockStyle],
      'scan:after': [updateHomePage, updateArchivePage],
      'article:add': [updateHomePage, updateArchivePage],
      // ... 更多钩子
    },
  };
}
```

## 主题配置接口

主题函数需要返回 Ezal 框架定义的 `ThemeConfig` 接口，具体可参考 `@packages/ezal/src/config.ts` 中的定义：

```ts
export interface ThemeConfig {
  assetsRoot: string;           // 资源根目录（绝对路径）
  transformRules?: TransformRule[];  // 转换规则
  layout: LayoutConfig;         // 布局配置
  pageHandlers: PageHandler[];  // 页面处理器
  hooks?: HookOptions;          // 钩子
}
```

## 布局模版

布局模版需要主题自行配置，参考 `@packages/ezal-theme-example/src/layout.ts`。主题需要自行选择并配置好 HTML 模版渲染器，转换成 Ezal 框架支持的接口，具体接口定义可参考 `@packages/ezal/src/items/layout.ts`。

布局模版的核心是 `LayoutConfig` 接口，包含：
- `root`: 布局文件根目录的绝对路径
- `compiler`: 布局编译器，将布局源文件编译为渲染器

布局编译器需要返回一个包含以下内容的对象：
- `renderer`: 布局渲染器，接收上下文并返回渲染结果
- `dependencies`: 布局模版依赖的文件路径数组（可选）

## 页面处理器

页面处理器定义了不同文件类型的解析和渲染规则：

```ts
interface PageHandler {
  exts: string | string[];  // 支持的文件扩展名
  parser: (src: string) => Promise<{ content: string, data: Record<string, any> }>; // 解析器
  renderer: (content: string, page: Page) => Promise<{ html: string, data: any }>; // 渲染器
}
```

示例：Markdown 页面处理器

```ts
export async function markdownPageHandler(): Promise<PageHandler> {
  return {
    exts: '.md',  // 处理 .md 文件
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

## 钩子

Ezal 提供了丰富的钩子来扩展主题功能：

### 构建生命周期钩子

- `config:after`: 配置加载后
- `scan:before`: 扫描前
- `scan:after`: 扫描后
- `build:before`: 构建前
- `build:after`: 构建后
- `preview:stop`: 预览停止

### 内容管理钩子

- `article:add`: 添加文章
- `article:update`: 更新文章
- `article:remove`: 删除文章
- `article:build:before`: 文章构建前
- `article:build:after`: 文章构建后
- `page:update`: 页面更新
- `page:remove`: 页面删除
- `page:build:after`: 页面构建后
- `category:add`: 添加分类
- `category:update`: 更新分类
- `category:remove`: 删除分类
- `tag:add`: 添加标签
- `tag:update`: 更新标签
- `tag:remove`: 删除标签
- `asset:add`: 添加资源
- `asset:update`: 更新资源
- `asset:remove`: 删除资源

示例：使用钩子更新归档页面

```ts
hooks: {
  'article:add': [updateArchivePage],
  'article:update': [updateArchivePage],
  'article:remove': [updateArchivePage],
}
```

## 资源转换

主题可以定义资源转换规则，用于处理 CSS、JS 等资源文件：

```ts
interface TransformRule {
  from: string;      // 源文件扩展名
  to: string;        // 目标文件扩展名
  transform: (src: string, dest: string) => Promise<void>; // 转换函数
}
```

示例：Stylus 转 CSS 转换规则

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
