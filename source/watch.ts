import { watch, FSWatcher } from "chokidar";
import { copyAssets } from "./assets";
import path from "path";
import { readThemeConfig } from "./config";
import { generateStyle } from "./style";
import { getLocale } from "./locale";
import { pages, posts, readPage, updatePage } from "./page";
import { render } from "./render";
import { generate } from "./generate";
import { autoGenerateProcedural } from "./procedural";
type EzalModule = import("./main").EzalModule;
type Page = import("./page").Page;
type Post = import("./page").Post;

export default class Watcher{
  assets = path.join(process.cwd(), 'assets');
  pages = path.join(process.cwd(), 'pages');
  posts = path.join(process.cwd(), 'posts');
  config = path.join(process.cwd(), 'config.yml');
  themePath: string;
  watcher: FSWatcher;
  themeConfig: string;
  themeAssets: string;
  themeStyle: string;
  themeDefaultConfig: string;
  themeLocale: string;
  themeName: string;
  ezalModule: EzalModule;
  _timer: any = {};
  constructor(ezalModule: EzalModule){
    this.ezalModule = ezalModule;
    this.themeName = ezalModule.config.theme;
    this.themePath = path.join(process.cwd(), 'themes', this.themeName);
    this.themeConfig = path.join(process.cwd(), this.themeName + '.config.yml');
    this.themeAssets = path.join(this.themePath, 'assets');
    this.themeStyle = path.join(this.themePath, 'style');
    this.themeDefaultConfig = path.join(this.themePath, 'config.yml');
    this.themeLocale = path.join(this.themePath, 'locale');
    this.watcher = watch(process.cwd());
    this.watcher.on('ready', ()=>{
      this.watcher.on('all', this._handler);
    });
  }
  _debounce = (fn: Function, name: string)=>{
    if (this._timer[name] !== undefined) {
      clearTimeout(this._timer[name]);
    }
    this._timer[name] = setTimeout(()=>{
      clearTimeout(this._timer[name]);
      this._timer[name] !== undefined;
      fn();
    }, 300);
  }
  _handler = (event: 'add'|'addDir'|'change'|'unlink'|'unlinkDir', dir: string)=>{
    if (['addDir', 'unlinkDir'].includes(event)) return;
    if (dir.includes(this.posts)) {
      return this._postHandler(event, dir);
    }
    if (dir.includes(this.pages)) {
      return this._pageHandler(event, dir);
    }
    if (dir.includes(this.themeConfig) || dir.includes(this.themeDefaultConfig)) {
      return this._debounce(this._configHandler, 'config');
    }
    if (dir.includes(this.assets) || dir.includes(this.themeAssets)) {
      return this._debounce(this._assetsHandler, 'assets');
    }
    if (dir.includes(this.themeStyle)) {
      return this._debounce(this._styleHandler, 'style');
    }
    if (dir.includes(this.themeLocale)) {
      return this._debounce(this._localeHandler, 'locale');
    }
    return autoGenerateProcedural(dir);
  }
  _assetsHandler = ()=>{
    return copyAssets(this.themeName);
  }
  _configHandler = async ()=>{
    this.ezalModule.theme = await readThemeConfig(this.ezalModule.config.theme);
  }
  _addPage = async (dir: string, type: 'page' | 'post')=>{
    let page = await readPage(dir, type);
    if (!page) return;
    await render(page);
    return generate(page);
  }
  _changePage = async (range: Set<Page | Post>, dir: string)=>{
    for (const page of Array.from(range)) {
      if (page.path === dir) {
        updatePage(page);
        await render(page);
        return generate(page);
      }
    }
  }
  _unlinkPage = async (range: Set<Page | Post>, dir: string)=>{
    for (const page of Array.from(range)) {
      if (page.path === dir) {
        return page.remove();
      }
    }
  }
  _pageHandler = async (event: 'add'|'addDir'|'change'|'unlink'|'unlinkDir', dir: string)=>{
    switch (event) {
      case 'add':
        return this._addPage(dir, 'page');
      case 'change':
        return this._changePage(pages, dir);
      case 'unlink':
        return this._unlinkPage(pages, dir);
    }
  }
  _postHandler = async (event: 'add'|'addDir'|'change'|'unlink'|'unlinkDir', dir: string)=>{
    switch (event) {
      case 'add':
        return this._addPage(dir, 'post');
      case 'change':
        return this._changePage(posts, dir);
      case 'unlink':
        return this._unlinkPage(posts, dir);
    }
  }
  _styleHandler = ()=>{
    return generateStyle();
  }
  _localeHandler = async ()=>{
    this.ezalModule.locale = await getLocale(this.ezalModule.config.language, this.themePath);
  }
  close(){
    return this.watcher.close();
  }
}
