# Theme directory structure
- assets
- layout
- plugin
- scripts
- style
- locales
- config.yml

## assets
The theme comes with a assets file that can be overwritten by the user's assets file.

## layout
HTML templates, using pug, are determined by the `layout` in the article and page to be used.

## scripts
Use the `module.exports` export function for initialization, asynchronous initialization is supported.
All files in files or folders with filenames starting with `_` will be automatically ignored.

## style
Style templates, using Stylus, [Ref](https://stylus-docs.netlify.app).
All files in files or folders with filenames starting with `_` will be automatically ignored.

## locales
For multilingual files, the default is `default.yml`, for creating English language files, it should be `en.yml`.

## config.yml
Theme configuration file, which will be merged with `<theme name>.config.yml`, `config.yml` has low priority.

# API

| Type                   | Description                                   |
| ---------------------- | --------------------------------------------- |
| `addListener`          | Add event listener                            |
| `pug`                  | pug options                                   |
| `stylus`               | stylus option                                 |
| `render`               | render a string in a specific format          |
| `config`               | Ezal configuration                            |
| `theme`                | theme configuration                           |
| `Page`                 | page object                                   |
| `Post`                 | article object                                |
| `pages`                | All pages                                     |
| `posts`                | all posts                                     |
| `categories`           | all categories                                |
| `tags`                 | all tags                                      |
| `setMarkdownExtension` | Set Markdown extensions                       |
| `setMarkdownTag`       | Set Markdown extensions in `{% tag %}` format |
| `util`                 | Tool functions                                |
| `locale`               | Multilingual                                  |

## Events

| Type            | Action Time                                    | Parameters                        |
| --------------- | ---------------------------------------------- | --------------------------------- |
| `init`          | initialize*                                    |                                   |
| `init-pages`    | after reading user-written articles and pages* |                                   |
| `pre-render`    | before rendering Markdown                      | `post: Post`                      |
| `post-render`   | after reading Markdown                         | `post: Post`                      |
| `pre-generate`  | before generating HTML                         | `post: Post`                      |
| `post-generate` | after generating HTML                          | `{ post: Post, html: string }`    |
| `pre-style`     | before generating styles                       | `{ stylus: string, css: string }` |
| `post-style`    | post-style                                     | `{ stylus: string, css: string }` |
| `pre-assets`    | before copying resource files                  |                                   |
| `post-assets`   | after copying the resource file                |                                   |

`*` is an event that will only be dispatch once.

Example:
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

## pug, stylus options
Add other objects to this object to call them in the pug or stylus templates.

Note that pug and stylus do not support asynchronous functions.

Example:
```js
const { pug } = require('ezal');

module.exports = ()=>{
  pug.log = console.log;
}
```

| Built-in APIs available in pug | Description         |
| ------------------------------ | ------------------- |
| `config`                       | ezal configuration  |
| `theme`                        | theme configuration |
| `pages`                        | all pages           |
| `posts`                        | all posts           |
| `categories`                   | all categories      |
| `tags`                         | all tags            |
| `lang`                         | language            |
| `util`                         | tools and methods   |

## Render
Rendering of pug templates, markdown, and strings conforming to stylus syntax is supported.

Example:
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

### Set codeblock render function
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

## Create a page or post
```js
const { Page, Post } = require('ezal');

module.exports = ()=>{
  new Page('Relative URL of the page', 'markdown context');
  new Post('Relative URL of the post', 'markdown context');
}
```

## Set Markdown extensions
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

### Override extension
Extensions can be overridden when their `name` and `level` are the same, here are the built-in extensions.
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

## Set Markdown tag extensions
Similar to the use of `setMarkdownExtension`. No need for `start` and `match`.
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
