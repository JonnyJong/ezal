type Page = import('./page').Page;
type Post = import('./page').Post;
import { readdir } from "fs/promises";
import { marked } from "marked";
import path from "path";
import hljs from "highlight.js";

function initMarked(options: any) {
  return readdir(path.join(process.cwd(), 'plugin/marked'), { withFileTypes: true }).then((files)=>{
    let added: Set<string> = new Set();
    let plugins: any[] = [];
    files.forEach((dirent)=>{
      if (dirent.isFile() && ['.js', '.node'].includes(path.extname(dirent.name)) && !added.has(path.parse(dirent.name).name)) {
        added.add(path.parse(dirent.name).name);
        plugins.push(require(path.join(process.cwd(), 'plugin/marked', path.parse(dirent.name).name))(options));
      }
    });
    marked.setOptions({
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
function render(page: Page | Post) {
  page.context = marked(page.source);
  return page;
}
function renderAll(pages: Set<Page | Post>) {
  return pages.forEach(render);
}

export{
  initMarked,
  render,
  renderAll,
};
