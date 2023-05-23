# Theme directory structure
- assets
- layout
- plugin
- scripts
- style
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

## config.yml
Theme configuration file, which will be merged with `<theme name>.config.yml`, `config.yml` has low priority.

# API

| Type                 | Description                           |
| -------------------- | ------------------------------------- |
| `addListener`        | Add event listener                    |
| `pug`                | pug options                           |
| `stylus`             | stylus option                         |
| `render`             | render a string in a specific format  |
| `config`             | Ezal configuration                    |
| `theme`              | theme configuration                   |
| `Page`               | page object                           |
| `Post`               | article object                        |
| `pages`              | All pages                             |
| `posts`              | all posts                             |
| `categories`         | all categories                        |
| `tags`               | all tags                              |
| `setMarkedHighlight` | set Marked code highlighting function |
| `setMarkedExtension` | set Marked Extension                  |

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

## Render
Rendering of pug templates, markdown, and strings conforming to stylus syntax is supported.

Example:
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

## Create a page or post
```js
const { Page, Post } = require('ezal');

module.exports = ()=>{
  new Page('Relative URL of the page', 'markdown context');
  new Post('Relative URL of the post', 'markdown context');
}
```

## Modify the code highlighting function
[Ref](https://www.npmjs.com/package/marked-highlight).

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

## Add Marked extension
[Ref](https://marked.js.org/using_pro#extensions), supports asynchronous.

```js
const { setMarkedExtension } = require('ezal');

module.exports = ()=>{
  setMarkedExtension([
    ...markedExtension
  ]),
}
```
