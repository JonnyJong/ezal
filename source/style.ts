import { readdirSync } from "fs";
import { access, mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import stylus from "stylus";
type StylusRenderer = import("stylus/lib/renderer");

let styleBase: string;

function readFiles(dir: string) {
  let result: Array<string> = [];
  readdirSync(dir, { withFileTypes: true }).forEach((dirent)=>{
    if (dirent.name.indexOf('_') === 0) return;
    if (dirent.isFile() && path.extname(dirent.name) === '.styl') {
      result.push(path.join(dir, dirent.name));
    }else if (dirent.isDirectory()) {
      result = result.concat(readFiles(path.join(dir, dirent.name)));
    }
  });
  return result;
}

let globalOptions: any;
let themePath: string;
let dispatchEvent: Function;
function initStylus(ezalModule: any, themeDir: string, eventDispatcher: Function) {
  dispatchEvent = eventDispatcher;
  styleBase = path.join(themeDir, 'style');
  globalOptions = ezalModule;
  themePath = themeDir;
  ezalModule.render.stylus = renderStylus;
}

function difineStyleOption(style: StylusRenderer, options: any) {
  for (const key in options) {
    if (Object.prototype.hasOwnProperty.call(options, key)) {
      style.define(key, options[key]);
    }
  }
}

function renderStylus(stylusContext: string, options: any = {}, paths: any, filename: any) {
  let style = stylus(stylusContext);
  let stylusOptions = Object.assign({
    config: globalOptions.config,
    theme: globalOptions.theme,
    pages: globalOptions.pages,
    posts: globalOptions.posts,
    categories: globalOptions.categories,
    tags: globalOptions.tags,
  }, globalOptions.stylus.var, options);
  style.define('get', ({string})=>{
    let target = stylusOptions;
    string.split('.').forEach((key: string)=>{
      target = target[key];
    });
    return target;
  });
  for (const key in globalOptions.stylus.function) {
    if (!Object.prototype.hasOwnProperty.call(globalOptions.stylus.function, key)) {
      continue;
    }
    if (typeof globalOptions.stylus.function[key] !== 'function') {
      continue;
    }
    style.define(key, globalOptions.stylus.function[key]);
  }
  style.set('paths', paths);
  style.set('filename', filename);
  return style.render();
}

interface StyleContent{
  stylus: any;
  css: any;
};

async function generateStyle() {
  let files = readFiles(path.join(themePath, 'style'));
  for (let i = 0; i < files.length; i++) {
    let styleContent: StyleContent = {
      stylus,
      // @ts-ignore
      css: '',
    }
    styleContent.stylus = await readFile(files[i], 'utf-8')
    await dispatchEvent('pre-style', styleContent)
    styleContent.css = renderStylus(
      styleContent.stylus,
      {},
      [path.dirname(files[i])],
      path.basename(files[i]),
    );
    await dispatchEvent('post-style', styleContent)
    const outputDir = path.join(process.cwd(), 'out/style', path.dirname(files[i].replace(styleBase, '')));
    await access(outputDir)
    .catch(()=>mkdir(outputDir, { recursive: true }));
    await writeFile(path.join(outputDir, path.parse(files[i].replace(styleBase, '')).name + '.css'), styleContent.css, 'utf8');
  }
}

export {
  initStylus,
  generateStyle,
};
