type Page = import('./page').Page;
type Post = import('./page').Post;
import { access, mkdir, writeFile } from 'fs/promises';
import path from 'path';
import pug from 'pug';

let globalOptions: any;
let themePath: string;
let dispatchEvent: Function;
function initPug(ezalModule: any, themeDir: string, eventDispatcher: Function) {
  globalOptions = ezalModule;
  themePath = themeDir;
  dispatchEvent = eventDispatcher;
  ezalModule.render.pug = renderPug;
}

async function renderPug(layoutName: string, options: any = {}) {
  let layoutPath = path.join(themePath, 'layout', layoutName + '.pug');
  let layoutAccessable = await access(layoutPath).then(()=>true).catch(()=>false);
  if (!layoutAccessable) layoutPath = path.join(themePath, 'layout', 'page.pug');
  return pug.renderFile(layoutPath, Object.assign({
    config: globalOptions.config,
    theme: globalOptions.theme,
    pages: globalOptions.pages,
    posts: globalOptions.posts,
    categories: globalOptions.categories,
    tags: globalOptions.tags,
  }, globalOptions.pug, options));
}

async function generate(page: Page | Post) {
  await dispatchEvent('pre-generate', page);
  let result = await renderPug(page.layout, {page});
  let outputDir = path.join(process.cwd(), 'out', page.url);
  await access(outputDir)
  .catch(()=>mkdir(outputDir, { recursive: true }));
  await dispatchEvent('post-generate', {page, html: result});
  await writeFile(path.join(outputDir, 'index.html'), result, 'utf8');
  return
}
async function generateAll(pages: Array<Page | Post>) {
  for (let i = 0; i < pages.length; i++) {
    await generate(pages[i]);
  }
}

export{
  initPug,
  generate,
  generateAll,
};
