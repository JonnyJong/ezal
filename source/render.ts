type Page = import('./page').Page;
type Post = import('./page').Post;
type Renderers = import('../types/renderer').Renderers
type Renderer = import('../types/renderer').Renderer
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

let renderers: Renderers = {
  block: [],
  line: [],
  inline: [],
}

function addRenderer(type: 'block' | 'line' | 'inline', renderer: Renderer) {
  let index = renderers[type].findIndex((oldRenderer)=>oldRenderer.name === renderer.name);
  if (index === -1) {
    // @ts-ignore
    renderers[type].push(renderer);
    return;
  }
  if ((renderers[type][index].priority || 0) <= (renderer.priority || 0)) {
    renderers[type][index] = renderer;
  }
}

async function loadRenderers(dir: string) {
  let renderers = await readdir(dir);
  for (let i = 0; i < renderers.length; i++) {
    let importRenderers: Renderers = require(path.join(dir, path.basename(renderers[i])));
    importRenderers.block.forEach((renderer)=>addRenderer('block', renderer));
    importRenderers.line.forEach((renderer)=>addRenderer('line', renderer));
    importRenderers.inline.forEach((renderer)=>addRenderer('inline', renderer));
  }
  return
}

async function initRenderer(themeDir: string) {
  loadRenderers(path.join(__dirname, './renderer/'));
  loadRenderers(path.join(themeDir, './scripts/renderer/'));
}

export{
  initMarked,
  render,
  renderAll,
  initRenderer,
};
