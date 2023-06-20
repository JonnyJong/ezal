import { info } from "./console";
import readConfig, { checkConfig, checkThemeConfig, readThemeConfig } from "./config";
import { readPages, readPosts, pages, posts, categoriesRoot, tags, Page, Post, updatePage, readPage } from "./page";
import { addListener, dispatchEvent } from "./event";
import { initRenderer, render, renderAll } from "./render";
import { generate, generateAll, initPug } from "./generate";
import { generateStyle, initStylus } from "./style";
import { copyAssets, initAssets } from "./assets";
import clean from "./clean";
import Watcher from "./watch";
import { startServer, stopServer } from "./serve";
import init from "./init";
import path from "path";
import Module from "module";
import { loadScript } from "./script-loader";
import util from "./util";
import { getLocale } from "./locale";
type CategoryRoot = import("./category").CategoryRoot;
type Tags = import("./tag").Tags;
type MarkdownMatched = import('./markdown').MarkdownMatched;
type MarkdownExtensionVariables = import('./markdown').MarkdownExtensionVariables;
export type EzalModule = {
  addListener: Function;
  pug: any;
  stylus: {
    var: object,
    function: object,
  };
  render: {
    markdown?: Function;
    markdownLine?: Function;
    pug?: Function;
    stylus?: Function;
    codeblock?: (matched: MarkdownMatched, v: MarkdownExtensionVariables)=>string,
  };
  config: any;
  theme: any;
  Page: any;
  Post: any;
  pages: Set<import('./page').Page>;
  posts: Set<import('./page').Post>;
  categories:  CategoryRoot;
  tags: Tags;
  setMarkdownExtension?: Function,
  setMarkdownTag?:Function,
  util: any,
  locale?: any,
};

let ezalModule: EzalModule = {
  // event
  addListener,
  // pug objects
  pug: {
    url_for: util.url_for,
    full_url_for: util.full_url_for,
    now: util.now,
    parseDate: util.parseDate,
  },
  // stylus objects
  stylus: {var:{}, function: {}},
  // render functions
  render: {},
  // config
  config: {},
  theme: {},
  // about pages
  Page,
  Post,
  pages,
  posts,
  categories: categoriesRoot,
  tags,
  util,
};

function initEzalModule() {
  // @ts-ignore
  let originLoader = Module._load;
  // @ts-ignore
  Module._load = function _load(...args: any){
    if (args[0] !== 'ezal') return originLoader(...args);
    return ezalModule;
  }
}

async function build() {
  let startStamp = Date.now();

  info('Initializing...');
  await checkConfig();
  await initEzalModule();

  info('Loading config...');
  ezalModule.config = await readConfig();
  await checkThemeConfig(ezalModule.config.theme);
  ezalModule.theme = await readThemeConfig(ezalModule.config.theme);

  let themePath = path.join(process.cwd(), 'themes', ezalModule.config.theme);
  let locale = await getLocale(ezalModule.config.language, themePath);
  ezalModule.locale = locale;
  await initPug(ezalModule, themePath, dispatchEvent);
  await initStylus(ezalModule, themePath, dispatchEvent);
  await initRenderer(ezalModule, dispatchEvent);
  await initAssets(dispatchEvent);
  await loadScript(themePath);

  info(`Ready in ${Date.now() - startStamp}ms.`);

  await dispatchEvent('init');

  info('Loading pages and posts...');
  await readPages();
  await readPosts();
  await dispatchEvent('init-pages');

  info('Rendering...');
  await renderAll(Array.from(pages));
  await renderAll(Array.from(posts));
  await generateAll(Array.from(pages));
  await generateAll(Array.from(posts));

  await generateStyle();

  await copyAssets(ezalModule.config.theme);

  info('Done!');
}

function serve() {
  let watcher = new Watcher(ezalModule.config.theme, ()=>copyAssets(ezalModule.config.theme), async (event: 'add'|'addDir'|'change'|'unlink'|'unlinkDir')=>{
    if (event.includes('Dir')) return;
    await generateAll(Array.from(pages));
    await generateAll(Array.from(posts));
  }, async (event: 'add'|'addDir'|'change'|'unlink'|'unlinkDir', url: string)=>{
    if (event.includes('Dir')) return;
    switch (event) {
      case 'unlink':
        pages.forEach((page)=>{
          if (page.path === url) page.remove();
        });
        break;
      case 'change':
        await pages.forEach(async (page)=>{
          if (page.path === url) {
            updatePage(page);
            await render(page);
            await generate(page);
          }
        });
        break;
      case 'add':
        await readPage(url, 'page');
        break;
    }
  }, async (event: 'add'|'addDir'|'change'|'unlink'|'unlinkDir', url: string)=>{
    if (event.includes('Dir')) return;
    switch (event) {
      case 'unlink':
        posts.forEach((post)=>{
          if (post.path === url) post.remove();
        });
        break;
      case 'change':
        await posts.forEach(async (post)=>{
          if (post.path === url) {
            updatePage(post);
            await render(post);
            await generate(post);
          }
        });
        break;
      case 'add':
        await readPage(url, 'post');
        break;
    }
  }, generateStyle);
  startServer();

  process.on('SIGINT', async ()=>{
    stopServer();
    await watcher.close();
  });
  process.on('exit', async ()=>{
    stopServer();
    await watcher.close();
  });
}

if (process.argv.includes('clean')) {
  info('Cleaning...');
  clean();
}else if (process.argv.includes('serve')) {
  build().then(serve);
}else if (process.argv.includes('init')) {
  init();
}else{
  build();
}
