import { info } from "./console";
import readConfig, { checkConfig, checkThemeConfig, readThemeConfig } from "./config";
import { readPages, readPosts, pages, posts, categoriesRoot, tags, Page, Post } from "./page";
import { addListener, dispatchEvent } from "./event";
import { initRenderer, renderAll } from "./render";
import { generateAll, initPug } from "./generate";
import { generateStyle, initStylus } from "./style";
import { copyAssets, initAssets } from "./assets";
import clean from "./clean";
import Watcher from "./watch";
import { startServer, stopServer } from "./serve";
import init from "./init";
import path from "path";
import Module from "module";
import { loadScript } from "./script-loader";
import { getLocale } from "./locale";
import { generateAllProcedural, setProceduralGenerater } from "./procedural";
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
  util?: any,
  locale?: any,
  setProceduralGenerater: Function,
};

let ezalModule: EzalModule = {
  // event
  addListener,
  // pug objects
  pug: {},
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
  setProceduralGenerater: setProceduralGenerater,
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
  ezalModule.locale = await getLocale(ezalModule.config.language, themePath);
  await initPug(ezalModule, themePath, dispatchEvent);
  await initStylus(ezalModule, themePath, dispatchEvent);
  await initRenderer(ezalModule, dispatchEvent);
  await initAssets(dispatchEvent);
  await loadScript(themePath);
  let util = require('./util')(ezalModule.config);
  ezalModule.util = util;
  ezalModule.pug.url_for = util.url_for;
  ezalModule.pug.full_url_for = util.full_url_for;
  ezalModule.pug.now = util.now;
  ezalModule.pug.parseDate = util.parseDate;

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
  await generateAllProcedural();

  await generateStyle();

  await copyAssets(ezalModule.config.theme);

  info('Done!');
}

function serve() {
  let watcher = new Watcher(ezalModule);
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
