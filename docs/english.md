# Theme directory structure
- assets
- layout
- plugin
  - marked
  - pug
  - stylus
  - highlight.js
- scripts
  - pre-render
  - post-render
  - generate
  - post-generate
  - post-assets
- style
- config.yml

## assets
The theme comes with a assets file that can be overwritten by the user's assets file.

## layout
HTML templates, using pug, are determined by the `layout` in the article and page to be used.

## plugin/marked
A plugin for the marked renderer, [Ref](https://marked.js.org/using_pro#extensions), supports asynchronous.
Files in subfolders will be ignored.

## plugin/pug
Use `module.exports` to export objects that can be called in HTML templates.
Files in subfolders will be ignored.

## plugin/stylus
Use `module.exports` to export objects that can be called in style templates.
Files in subfolders will be ignored.

## plugin/highlight.js
Use `module.exports` to export functions to replace Ezal's own code highlighting, [Ref](https://www.npmjs.com/package/marked-highlight).
```js
module.exports = (code, lang)=>hljs.highlightAuto(code, [lang.split('%')[0]]).value;
```

## scripts
Use `module.exports` to export functions with asynchronous support.

| 文件夹        | 时机             |
|---------------|------------------|
| pre-render    | 渲染 Markdown 前 |
| post-render   | 渲染 Markdown 后 |
| generate      | 生成文件时       |
| post-generate | 生成文件后       |
| post-assets   | 复制资源后       |

## style
Style templates, using Stylus, [Ref](https://stylus-docs.netlify.app).
Will generate all files in files or folders that do not start with `_` as their filename.

## config.yml
Theme configuration file, which will be merged with `<theme name>.config.yml`, `config.yml` has low priority.

# API
Applies to all script files except `plugin/highlight.js`.

Example:
```js plugin/
module.exports = ({config, theme, pages, posts, categories, tags, Page, Post})=>{
  // Configuration parameters from config.yml
  config;
  // Configuration parameters of the theme
  theme;
  // All pages
  pages;
  // All articles
  posts;
  // categories
  categories;
  // Tags
  tags;
  // Create a new page
  new Page(path, markdownSource);
  // Create a new article
  new Post(path, markdownSource);
}
```

Asynchronous example:
```js
module.exports = async ()=>{
  return async ()=>{}
}
```

For `plugin/pug` and `plugin/stylus`, asynchronous functions are not available.
Correct example:
```js
module.exports = async ()=>{
  return ()=>{}
}
```
```js
module.exports = ()=>{
  return ()=>{}
}
```
Example of error:
```js
module.exports = async ()=>{
  return async ()=>{}
}
```
