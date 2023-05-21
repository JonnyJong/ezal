type Page = import('./page').Page;
type Post = import('./page').Post;
import { access, readdir } from "fs/promises";
import { marked } from "marked";
import path from "path";
import hljs from "highlight.js";
import { markedHighlight } from "marked-highlight";
// @ts-ignore
import { mangle } from "marked-mangle";
// @ts-ignore
import { gfmHeadingId } from "marked-gfm-heading-id";

async function initMarked(options: any, themePath: string) {
  let files = await readdir(path.join(themePath, 'plugin/marked'), { withFileTypes: true })
  let added: Set<string> = new Set();
  let plugins: any[] = [];
  files.forEach((dirent)=>{
    if (dirent.isFile() && ['.js', '.node'].includes(path.extname(dirent.name)) && !added.has(path.parse(dirent.name).name)) {
      added.add(path.parse(dirent.name).name);
      plugins.push(require(path.join(themePath, 'plugin/marked', path.parse(dirent.name).name))(options));
    }
  });
  let themeHljsAccessable = await access(path.join(themePath, 'plugin/highlight.js')).then(()=>true,()=>false);
  let themeHljs;
  if (themeHljsAccessable) {
    themeHljs = require(path.join(themePath, 'plugin/highlight.js'));
  }
  marked.setOptions({
    async: true,
    breaks: true,
    gfm: true,
    // @ts-ignore
    tables: true,
  });
  marked.use({
    extensions: plugins,
  });
  marked.use(themeHljsAccessable ? themeHljs : markedHighlight({
    langPrefix: 'hljs language-',
    async: true,
    highlight(code, lang) {
      return hljs.highlightAuto(code, [lang]).value;
    },
  }));
  marked.use(mangle());
  marked.use(gfmHeadingId({
    perfix: '',
  }));
}
async function render(page: Page | Post) {
  page.context = await marked(page.source);
  return page;
}
async function renderAll(pages: Array<Page | Post>) {
  for (let i = 0; i < pages.length; i++) {
    await render(pages[i]);
  }
  return;
}

export{
  initMarked,
  render,
  renderAll,
};
