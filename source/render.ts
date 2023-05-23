type Page = import('./page').Page;
type Post = import('./page').Post;
import { marked } from "marked";
import hljs from "highlight.js";
// @ts-ignore
import { markedHighlight } from "marked-highlight";
// @ts-ignore
import { mangle } from "marked-mangle";
// @ts-ignore
import { gfmHeadingId } from "marked-gfm-heading-id";

let dispatchEvent: Function;
function initRenderer(ezalModule: any, eventDispatcher: Function) {
  dispatchEvent = eventDispatcher;
  marked.setOptions({
    async: true,
    breaks: true,
    gfm: true,
    // @ts-ignore
    tables: true,
  });
  marked.use(mangle());
  marked.use(gfmHeadingId({
    perfix: '',
  }));
  marked.use(markedHighlight({
    langPrefix: 'hljs language-',
    async: true,
    highlight(code, lang){
      return hljs.highlightAuto(code, [lang]).value;
    }
  }));
  ezalModule.setMarkedHighlight = function(markedHighlight: marked.MarkedExtension) {
    marked.use(markedHighlight);
  };
  ezalModule.setMarkedExtension = function(markedExtensions: marked.TokenizerAndRendererExtension[]){
    marked.use({
      extensions: markedExtensions,
    });
  };
  ezalModule.render.markdown = function(source: string){
    return marked(source);
  };
}

async function render(page: Page | Post) {
  await dispatchEvent('pre-render', page);
  page.context = await marked(page.source);
  await dispatchEvent('post-render', page);
  return page;
}
async function renderAll(pages: Array<Page | Post>) {
  for (let i = 0; i < pages.length; i++) {
    await render(pages[i]);
  }
  return;
}

export{
  initRenderer,
  render,
  renderAll,
};
