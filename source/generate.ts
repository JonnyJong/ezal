type Page = import('./page').Page;
type Post = import('./page').Post;
type EzalModule = import('./main').EzalModule;
import { access } from 'fs/promises';
import { writeFile } from './util';
import path from 'path';
import pug from 'pug';

let globalOptions: any;
let themePath: string;
let dispatchEvent: Function;
function initPug(ezalModule: EzalModule, themeDir: string, eventDispatcher: Function) {
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
    lang: globalOptions.locale,
    util: globalOptions.util,
  }, globalOptions.pug, options));
}

async function generate(page: Page | Post) {
  await dispatchEvent('pre-generate', page);
  let result = await renderPug(page.layout, {page});
  result = await dispatchEvent('post-generate', {page, html: result});
  await writeFile(path.join(process.cwd(), 'out', page.url, 'index.html'), result, 'utf-8');
  return;
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
  renderPug,
};
