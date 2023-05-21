# 主题结构
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
主题自带的资源文件，可被用户的资源文件覆盖。

## layout
HTML 模板，使用 pug，由文章和页面中的`layout`确定使用的模板。

## plugin/marked
marked 渲染器的插件，[参考](https://marked.js.org/using_pro#extensions)，支持异步。
子文件夹中的文件将被忽略。

## plugin/pug
使用`module.exports`导出对象，可在 HTML 模板中调用。
子文件夹中的文件将被忽略。

## plugin/stylus
使用`module.exports`导出对象，可在样式模板中调用。
子文件夹中的文件将被忽略。

## plugin/highlight.js
使用`module.exports`导出函数，用于替代 Ezal 自带的代码高亮，[参考](https://www.npmjs.com/package/marked-highlight)。
```js
module.exports = (code, lang)=>hljs.highlightAuto(code, [lang.split('%')[0]]).value;
```

## scripts
使用`module.exports`导出函数，支持异步。

| 文件夹        | 时机             |
|---------------|------------------|
| pre-render    | 渲染 Markdown 前 |
| post-render   | 渲染 Markdown 后 |
| generate      | 生成文件时       |
| post-generate | 生成文件后       |
| post-assets   | 复制资源后       |

## style
样式模板，使用 Stylus，[参考](https://stylus-docs.netlify.app)。
会生成所有不以`_`开头为文件名的文件或文件夹中的文件。

## config.yml
主题配置文件，会与`<主题名>.config.yml`合并，`config.yml`优先级低。

# API
适用于除`plugin/highlight.js`外的所有脚本文件。

示例：
```js plugin/
module.exports = ({config, theme, pages, posts, categroies, tags, Page, Post})=>{
  // 来自 config.yml 的配置参数
  config;
  // 主题的配置参数
  theme;
  // 所有页面
  pages;
  // 所有文章
  posts;
  // 归类
  categroies;
  // 标签
  tags;
  // 创建新的页面
  new Page(path, markdownSource);
  // 创建新的文章
  new Post(path, markdownSource);
}
```

异步示例：
```js
module.exports = async ()=>{
  return async ()=>{}
}
```

对于`plugin/pug`和`plugin/stylus`，异步函数不可用。
正确示例：
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
错误示例：
```js
module.exports = async ()=>{
  return async ()=>{}
}
```
