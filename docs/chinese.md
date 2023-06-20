# 主题结构
- assets
- layout
- plugin
- scripts
- style
- locales
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

## locales
多语言文件，默认为 `default.yml`，若要创建中文语言文件，应为 `zh-CN.yml`。

## config.yml
主题配置文件，会与`<主题名>.config.yml`合并，`config.yml`优先级低。

# 接口

| 类型                   | 描述                                  |
| ---------------------- | ------------------------------------- |
| `addListener`          | 添加事件监听器                        |
| `pug`                  | pug 选项                              |
| `stylus`               | stylus 选项                           |
| `render`               | 渲染特定格式的字符串                  |
| `config`               | Ezal 配置                             |
| `theme`                | 主题配置                              |
| `Page`                 | 页面对象                              |
| `Post`                 | 文章对象                              |
| `pages`                | 所有页面                              |
| `posts`                | 所有文章                              |
| `categories`           | 所有分类                              |
| `tags`                 | 所有标签                              |
| `setMarkdownExtension` | 设置 Markdown 扩展                    |
| `setMarkdownTag`       | 设置 `{% tag %}` 格式的 Markdown 扩展 |
| `util`                 | 工具函数                              |
| `locale`               | 多语言                                |

## 事件

| 类型            | 作用时机                    | 参数                              |
| --------------- | --------------------------- | --------------------------------- |
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

| pug 中可使用的内置 API | 描述      |
| ---------------------- | --------- |
| `config`               | ezal 配置 |
| `theme`                | 主题配置  |
| `pages`                | 所有页面  |
| `posts`                | 所有文章  |
| `categories`           | 所有分类  |
| `tags`                 | 所有标签  |
| `lang`                 | 语言      |
| `util`                 | 工具方法  |

## 渲染
支持渲染 pug 模板、markdown、符合 stylus 语法的字符串。

示例：
```js
const { render } = require('ezal');

module.exports = async ()=>{
  await render.pug("pug file's name in theme's layout folder", pugOption);
  (await render.markdown('# Hello World')).context;
  await render.stylus(`
    body
      margin 0
  `, stylusOption);
}
```

### 设置代码块渲染函数
```ts
import { config, render } from "ezal";
import hljs from "highlight.js";
type MarkdownMatched = {
  /**
   * Matched codeblock string, do not modify.
   */
  raw: string,
  /**
   * Code string.
   */
  text: string,
  /**
   * Arguments from codeblock head.
   */
  args: string[],
  /**
   * Argument string.
   */
  arg: string,
};
type MarkdownExtensionVariables = {
  page?: Page | Post,
  /**
   * Shared variables when rendering markdown
   */
  markdown: any,
};
render.codeblock = async (matched: MarkdownMatched, v: MarkdownExtensionVariables)=>{
  let lang = (matched.args && matched.args[0]) ? [matched.args[0]] : undefined;
  let result = hljs.highlightAuto(matched.text, lang);
  return`<pre><code${result.language ? ` class="${config.markdown.highlight_prefix}${result.language}"` : ''}>${result.value}</code></pre>`;
};
```

## 创建页面或文章
```js
const { Page, Post } = require('ezal');

module.exports = ()=>{
  new Page('Relative URL of the page', 'markdown context');
  new Post('Relative URL of the post', 'markdown context');
}
```

## 设置 Markdown 扩展
```js
const { setMarkdownExtension } = require('ezal');
const ext1 = {
  name: 'ext1',
  level: 'block',
  start(src){
    return src.indexOf('hello world');
  },
  match(src){
    return{
      raw: 'hello world',
      text: 'hello world',
    };
  },
  async render(){
    return`<b>Hello World!</b>`;
  },
};
setMarkdownExtension(ext1);
const ext2 = {
  name: 'ext2',
  level: 'inline',
  async start(src){
    return src.match(/match rule/)?.index;
  },
  match(src, v){
    let matched = src.match(/match rule/);
    if (!matched) return;
    if (typeof v.markdown.ext2 === 'number') {
      v.markdown.ext2++;
    }else{
      v.markdown.ext2 = 0;
    }
    return{
      raw: matched[0],
      text: matched[1],
    };
  },
  async render(matched, v){
    let result = await getSomething(v.markdown.ext2);
    return`<div>${result}${matched.text}</div>`;
  },
};
const ext3 = {
  name: 'ext3',
  level: 'block',
  priority: 10,
  start(src){
    return src.match(/match rule/)?.index;
  },
  async match(src){
    return await doSomthing(src);
  },
  render(matched){
    return matched.text;
  },
};
setMarkdownExtension([ext2, ext3]);
```

### 覆盖扩展
当扩展的`name`和`level` 相同时，就可以覆盖，以下是内置的扩展。
| block                | inline                  |
| -------------------- | ----------------------- |
| `heading`            |                         |
| `heading-underscore` |                         |
| `blockquote`         |                         |
| `codeblock`          | `code`                  |
| `fence-codeblock`    | `code-double`           |
| `footnote-source`    | `footnote`              |
|                      | `link`                  |
|                      | `image`                 |
|                      | `pointed-bracket-link`  |
|                      | `pointed-bracket-email` |
| `quote-link-source`  | `quote-link`            |
| `hr`                 |                         |
| `ol`                 |                         |
| `ul`                 |                         |
| `dl`                 |                         |
| `table`              |                         |
|                      | `bold`                  |
|                      | `italic`                |
|                      | `bold-italic`           |
|                      | `underscore`            |
|                      | `del`                   |
|                      | `escape`                |
|                      | `emoji`                 |

## 设置 Markdown tag 扩展
与 `setMarkdownExtension` 的使用方法相似。不需要 `start` 和 `match`。
```js
const { render, setMarkdownTag } = require('ezal');
setMarkdownTag({
  name: 'psw',
  level: 'inline',
  async render(matched, v){
    return`<psw>${(await render.markdownLine(matched.arg, v)).context}</psw>`;
  },
});
setMarkdownTag([{
  name: 'object',
  level: 'block',
  async render(matched, v){
    return`<object>${(await render.markdown(matched.text, v, false)).context}</object>`;
  },
}]);
```

```markdown
{% psw no password here! %}
{% object arg1 arg2 %}
- Write markdown here
- ![Image](./image.jpg)
{% endobject %}
```

```html
<p><psw>no password here!</psw></p><object><ul><li>Write markdown here</li><li><img src="./image.jpg" alt="Image"></li></ul></object>
```
