type Page = import('./page').Page;
type Post = import('./page').Post;
type EzalModule = import('./main').EzalModule;
import { init, markdown, markdownLine, getDefaultMarkdownV } from "./markdown";

let dispatchEvent: Function;
function initRenderer(ezalModule: EzalModule, eventDispatcher: Function) {
  dispatchEvent = eventDispatcher;
  init(ezalModule);
  ezalModule.render.markdown = markdown;
  ezalModule.render.markdownLine = markdownLine;
}

async function render(page: Page | Post) {
  await dispatchEvent('pre-render', page);
  let result = await markdown(page.source, { page, markdown: getDefaultMarkdownV() });
  page.context = result.context;
  await dispatchEvent('post-render', page, result.variables);
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
