type Page = import('./page').Page;
type Post = import('./page').Post;
import { readdir } from "fs/promises";
import { marked } from "marked";
import path from "path";
import hljs from "highlight.js";

function initMarked(options: any, themePath: string) {
  return readdir(path.join(themePath, 'plugin/marked'), { withFileTypes: true }).then((files)=>{
    let added: Set<string> = new Set();
    let plugins: any[] = [];
    files.forEach((dirent)=>{
      if (dirent.isFile() && ['.js', '.node'].includes(path.extname(dirent.name)) && !added.has(path.parse(dirent.name).name)) {
        added.add(path.parse(dirent.name).name);
        plugins.push(require(path.join(themePath, 'plugin/marked', path.parse(dirent.name).name))(options));
      }
    });
    marked.setOptions({
      async: true,
      breaks: true,
      gfm: true,
      // @ts-ignore
      tables: true,
      langPrefix: 'lang-',
      // todo: check .split('%')[0] do for what
      highlight: (code, lang)=>hljs.highlightAuto(code, [lang.split('%')[0]]).value,
    });
    marked.use({
      extensions: plugins,
    });
  });
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
