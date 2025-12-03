---
title: Markdown
date: 2025/11/23 12:31:01
updated: 2025/11/23
category: Documentation
tag: Documentation
---

ezal-theme-example uses ezal-markdown to render Markdown text, supporting the following syntax.

Setext Heading
===

Setext Secondary Heading
---

# ATX Heading

## ATX Secondary Heading
### ATX Tertiary Heading
#### ATX Quaternary Heading
##### ATX Quinary Heading

The theme enables a heading level offset, where a level 1 heading is rendered as `<h2>`, and so on, to ensure only one `<h1>` appears on a page.

# Text Emphasis
The **quick** *brown* fox ***jumps*** over a ~~lazy~~ dog.
A **quick** *brown* fox ***jumps*** over a ~~lazy~~ dog.

# Blockquote
> Blockquote

# Ordered List
1. First item
2. Second item
   1. Nested first item
   2. Nested second item
3. Third item

# Unordered List
- ABCDEFG
- HIJKLMN
  - OPQ
  - RST
- UVWXYZ

# Inline Code
Preview: `ezal serve --verbose`\
Build: `ezal build --clean`

# Links
[Home](/ "Go to home page")

[Ref link][ref]

[ref]: / "Ref link title"

# Images
A block-level image must be preceded and followed by a blank line or another block-level image. Block-level images support click-to-zoom.

![favicon](/favicon.svg)

Inline image: ![favicon](/favicon.svg)

# Tables

| Header  |      |        |       |
| ------- | :--- | :----: | ----: |
| Default | Left | Center | Right |

# Code Blocks
Code blocks are highlighted using `shiki` + `@vscode/vscode-languagedetection`.

```ts
import { hook } from '../hooks';
import type { Article } from './article';

const tags = new Map<string, Tag>();

export class Tag {
	/** Get all tags */
	static getAll(): Tag[] {
		return tags.values().toArray();
	}
	/** Set article tag */
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
	/** Tag name */
	get name() {
		return this.#name;
	}
	/** Get all articles for the tag */
	getArticles(): Article[] {
		return this.#articles.values().toArray();
	}
	/** Remove article from tag */
	removeArticle(article: Article) {
		this.#articles.delete(article);
		hook('tag:update', this);
		if (this.#articles.size > 0) return;
		tags.delete(this.#name);
		hook('tag:remove', this);
	}
	/** Whether the tag is destroyed */
	get destroyed(): boolean {
		return tags.get(this.#name) !== this;
	}
}
```

Shiki feature tests:
```ts
console.log('Hello'); // [!code --]
console.log('Ciao'); // [!code ++]
// [!code focus]
console.log('你好'); // [!code highlight]
console.error(new Error()); // [!code error]
console.warn('Warn!'); // [!code warning]
```

# Task Lists
- [x] Completed
- Incomplete
  - [ ] Incomplete
    - TEST
- [ ] Can be nested
  Supports block-level syntax
  ```js
  console.log('Hello world!');
  ```

# Math
Inline math: $E=mc^2$

Block-level math:
$
E=mc^2\dfrac{1}{2}
$

# Footnotes

This is an example of a basic footnote reference[^1]. You can also reference the same footnote multiple times[^1], or reference different footnotes[^2].

An example of a footnote with complex formatting[^special].

If you hover over the footnote reference, you can preview it without navigating away!

[^1]: Basic footnote content (a general description that can be referenced repeatedly)
[^2]: Standalone footnote content
[^special]: Footnote with complex formatting:
  Block-level syntax is supported here, like code blocks.
  Now, code blocks in the preview also support one-click copy!
  ```js
  console.log('Hello world!');
  ```
  Additionally, complex nesting is supported
  ::: Tags within footnotes
  +++ Nested test
  ```js
  console.log('Hello world!');
  ```
  +++
  ::: Tag 2
  ```js
  console.log('Hello world!');
  ```
  :::


# Theme Custom Syntax

## Tabs

::: Tab 1
Content of the first tab.
::: Tab 2
Content of the second tab.
::: *Markdown* syntax is supported in the tab label
```md
Tab content supports block-level *Markdown* syntax
```
:::

``````md
::: Tab 1
Content of the first tab.
::: Tab 2
Content of the second tab.
::: *Markdown* syntax is supported in the tab label
```md
Tab content supports block-level *Markdown* syntax
```
:::
``````

## Fold

+++ Click to expand for details
Block-level syntax can be used here:
```js
console.log('Hello world!');
```
+++

``````md
+++ Click to expand for details
Block-level syntax can be used here:
```js
console.log('Hello world!');
```
+++
``````

## Note

!!! info
Information you should be aware of.
!!!

!!! tip
A helpful tip.
!!!

!!! warn
Important information that requires immediate attention.
!!!

!!! danger
Advice about potential risks or negative outcomes from certain actions.
!!!

```md
!!! info
Information you should be aware of.
!!!

!!! tip
A helpful tip.
!!!

!!! warn
Important information that requires immediate attention.
!!!

!!! danger
Advice about potential risks or negative outcomes from certain actions.
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
