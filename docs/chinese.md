# 主题结构
- assets
- layout
- plugin
- scripts
- style
- config.yml

## assets
主题自带的资源文件，可被用户的资源文件覆盖。

## layout
HTML 模板，使用 pug，由文章和页面中的`layout`确定使用的模板。

## scripts
使用`module.exports`导出函数用于初始化，支持异步初始化。
所有以`_`开头为文件名的文件或文件夹中的文件将被自动忽略。

## style
样式模板，使用 Stylus，[参考](https://stylus-docs.netlify.app)。
所有以`_`开头为文件名的文件或文件夹中的文件将被自动忽略。

## config.yml
主题配置文件，会与`<主题名>.config.yml`合并，`config.yml`优先级低。

# 接口

| 类型                 | 描述                     |
|----------------------|--------------------------|
| `addListener`        | 添加事件监听器           |
| `pug`                | pug 选项                 |
| `stylus`             | stylus 选项              |
| `render`             | 渲染特定格式的字符串     |
| `config`             | Ezal 配置                |
| `theme`              | 主题配置                 |
| `Page`               | 页面对象                 |
| `Post`               | 文章对象                 |
| `pages`              | 所有页面                 |
| `posts`              | 所有文章                 |
| `categories`         | 所有分类                 |
| `tags`               | 所有标签                 |
| `setMarkedHighlight` | 设置 Marked 代码高亮函数 |
| `setMarkedExtension` | 设置 Marked 插件         |

## 事件

| 类型            | 作用时机                    | 参数                              |
|-----------------|-----------------------------|-----------------------------------|
| `init`          | 初始化*                     |                                   |
| `init-pages`    | 读取用户编写的文章和页面后* |                                   |
| `pre-render`    | 渲染 Markdown 前            | `post: Post`                      |
| `post-render`   | 读取 Markdown 后            | `post: Post`                      |
| `pre-generate`  | 生成 HTML 前                | `post: Post`                      | 
| `post-generate` | 生成 HTML 后                | `{ post: Post, html: string }`    | 
| `pre-style`     | 生成样式前                  | `{ stylus: string, css: string }` | 
| `post-style`    | 生成样式后                  | `{ stylus: string, css: string }` | 
| `pre-assets`    | 复制资源文件前              |                                   | 
| `post-assets`   | 复制资源文件后              |                                   | 

`*` 为只会触发一次的事件。

示例：
```js
const { addListener } = require('ezal');
const { getImageInfo } = require('package-for-image-processing');

const matchImgTags = /match <img> tags.../g;
const matchSrc = /match src.../;

module.exports = ()=>{
  addListener(`post-render`, async (post)=>{
    let imgs = matchImgTags.exec(post.context);
    let imgsInfo = [];
    for (img of imgs) {
      let src = matchSrc.exec(img);
      imgsInfo.push(await getImageInfo(src));
    }
    post.context = post.context.replace(matchImgTags, (originHTMl, index)=>{
      const { height, width, primaryColor} = imgsInfo[index];
      return `<div class="img" style="--height:${height}px;--width:${width}px;--color:${primaryColor}">${originHTMl}</div>`;
    });
    return;
  });
}
```

## pug、stylus 选项
向该对象中添加其他对象，即可在 pug 或 stylus 模板中调用这些对象。

需要注意的是，pug 和 stylus 不支持异步函数。

示例：
```js
const { pug } = require('ezal');

module.exports = ()=>{
  pug.log = console.log;
}
```

## 渲染
支持渲染 pug 模板、markdown、符合 stylus 语法的字符串。

示例：
```js
const { render } = require('ezal');

module.exports = async ()=>{
  await render.pug("pug file's name in theme's layout folder", pugOption);
  await render.markdown('# Hello World');
  await render.stylus(`
    body
      margin 0
  `, stylusOption);
}
```

## 创建页面或文章
```js
const { Page, Post } = require('ezal');

module.exports = ()=>{
  new Page('Relative URL of the page', 'markdown context');
  new Post('Relative URL of the post', 'markdown context');
}
```

## 修改代码高亮函数
[参考](https://www.npmjs.com/package/marked-highlight)。

```js
const { setMarkedHighlight } = require('ezal');
const { markedHighlight } = require('marked-highlight');
const hljs = require('highlight.js');

module.exports = ()=>{
  setMarkedHighlight(markedHighlight({
    langPrefix: 'hljs language-',
    async: true,
    highlight(code, lang){
      return hljs.highlightAuto(code, [lang]).value;
    }
  }));
}
```

## 添加 Marked 插件
[参考](https://marked.js.org/using_pro#extensions)，支持异步。

```js
const { setMarkedExtension } = require('ezal');

module.exports = ()=>{
  setMarkedExtension([
    ...markedExtension
  ]),
}
```
