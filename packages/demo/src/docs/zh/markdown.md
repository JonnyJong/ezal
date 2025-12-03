---
title: Markdown
date: 2025/11/23 12:31:00
updated: 2025/11/23
category: 文档
tag: 文档
---

ezal-theme-example 使用 ezal-markdown 来渲染 Markdown 文本，支持以下语法。

Setext 标题
===

Setext 二级标题
---

# ATX 标题

## ATX 二级标题
### ATX 三级标题
#### ATX 四级标题
##### ATX 五级标题

主题启用了标题级别偏移，即一级标题实际渲染为 `<h2>`，以此类推，用以确保一个页面中只出现一个 `<h1>`。

# 文本强调
The **quick** *brown* fox ***jumps*** over a ~~lazy~~ dog.
一只**快速**的*棕色*狐狸***跳过***了一只~~懒惰~~的狗。

# 引用块
> 引用块

# 有序列表
1. 第一项
2. 第二项
   1. 嵌套第一项
   2. 嵌套第二项
3. 第三项

# 无序列表
- ABCDEFG
- HIJKLMN
  - OPQ
  - RST
- UVWXYZ

# 单行代码
预览：`ezal serve --verbose`\
构建：`ezal build --clean`

# 链接
[Home](/ "Go to home page")

[Ref link][ref]

[ref]: / "Ref link title"

# 图像
块级图像前后必须为空行或其他块级图像。块级图像支持点击放大。

![favicon](/favicon.svg)

行内图像：![favicon](/favicon.svg)

# 表格

| 表头     |        |          |        |
| -------- | :----- | :------: | -----: |
| 默认对齐 | 左对齐 | 居中对齐 | 右对齐 |

# 代码块
代码块使用 `shiki` + `@vscode/vscode-languagedetection` 实现高亮。

```ts
import { hook } from '../hooks';
import type { Article } from './article';

const tags = new Map<string, Tag>();

export class Tag {
	/** 获取所有标签 */
	static getAll(): Tag[] {
		return tags.values().toArray();
	}
	/** 设置文章标签 */
	static setArticle(name: string, article: Article): Tag {
		let tag = tags.get(name);
		if (!tag) {
			tag = new Tag(name);
			tags.set(name, tag);
			hook('tag:add', tag);
		}
		tag.#articles.add(article);
		hook('tag:update', tag);
		return tag;
	}
	#name: string;
	#articles = new Set<Article>();
	constructor(name: string) {
		this.#name = name;
	}
	/** 标签名 */
	get name() {
		return this.#name;
	}
	/** 获取标签对应的所有文章 */
	getArticles(): Article[] {
		return this.#articles.values().toArray();
	}
	/** 从标签移除文章 */
	removeArticle(article: Article) {
		this.#articles.delete(article);
		hook('tag:update', this);
		if (this.#articles.size > 0) return;
		tags.delete(this.#name);
		hook('tag:remove', this);
	}
	/** 标签是否被销毁 */
	get destroyed(): boolean {
		return tags.get(this.#name) !== this;
	}
}
```

Shiki 特性测试：
```ts
console.log('Hello'); // [!code --]
console.log('Ciao'); // [!code ++]
// [!code focus]
console.log('你好'); // [!code highlight]
console.error(new Error()); // [!code error]
console.warn('Warn!'); // [!code warning]
```

# 任务列表
- [x] 已完成
- 未完成
  - [ ] 未完成
    - TEST
- [ ] 可嵌套
  支持块级语法
  ```js
  console.log('Hello world!');
  ```

# 数学公式
行内数学公式 $E=mc^2$

块级数学公式：
$$
E=mc^2\dfrac{1}{2}
$$

# 脚注

这是一个基本脚注引用[^1]的示例。也可以多次引用同一个脚注[^1]，或是引用不同脚注[^2]。

包含复杂格式的脚注示例[^special]。

如果将鼠标光标移动到脚注引用上，还可以在不跳转的情况下预览！

[^1]: 基础脚注内容（可重复引用的通用说明）
[^2]: 独立脚注内容
[^special]: 复杂格式脚注：
  此处支持块级语法，比如代码块。
  现在，预览中的代码块同样支持一键复制！
  ```js
  console.log('Hello world!');
  ```
  此外，还支持复杂的嵌套
  ::: 脚注内的标签
  +++ 嵌套测试
  ```js
  console.log('Hello world!');
  ```
  +++
  ::: 标签 2
  ```js
  console.log('Hello world!');
  ```
  :::


# 主题自定义语法

## Tabs

::: 标签 1
第一个标签的内容。
::: 标签 2
第二个标签的内容。
::: 标签处支持行级 *Markdown* 语法
```md
标签内容支持块级 *Markdown* 语法
```
:::

``````md
::: 标签 1
第一个标签的内容。
::: 标签 2
第二个标签的内容。
::: 标签处支持行级 *Markdown* 语法
```md
标签内容支持块级 *Markdown* 语法
```
:::
``````

## Fold

+++ 展开查看详情
此处可以使用块级语法：
```js
console.log('Hello world!');
```
+++

``````md
+++ 展开查看详情
此处可以使用块级语法：
```js
console.log('Hello world!');
```
+++
``````

## Note

!!! info
应当了解的信息。
!!!

!!! tip
提示信息。
!!!

!!! warn
需要立即关注的重要信息。
!!!

!!! danger
关于某些行动可能带来的风险或负面结果的建议。
!!!

```md
!!! info
应当了解的信息。
!!!

!!! tip
提示信息。
!!!

!!! warn
需要立即关注的重要信息。
!!!

!!! danger
关于某些行动可能带来的风险或负面结果的建议。
!!!
```

## Kbd

Press {{ctrl}} {{shift}} {{del}} to do something...

```md
Press {{ctrl}} {{shift}} {{del}} to do something...
```

## Link

@@

@ #link
Markdown
Ezal Blog Framework

@ #link
Markdown

@ #link /favicon.svg
Markdown

@ #link /favicon.svg
Markdown
Ezal Blog Framework

@@

```md
@@

@ #link
Markdown
Ezal Blog Framework

@ #link
Markdown

@ #link /favicon.svg
Markdown

@ #link /favicon.svg
Markdown
Ezal Blog Framework

@@
```
