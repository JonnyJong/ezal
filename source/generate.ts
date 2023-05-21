type Page = import('./page').Page;
type Post = import('./page').Post;
import { access, mkdir, readdir, writeFile } from 'fs/promises';
import path from 'path';
import pug from 'pug';

let globalOptions: any;
let options: any = {};
let themePath: string;
function initPug(option: any, themeDir: string) {
  themePath = themeDir;
  globalOptions = option
  return readdir(path.join(themePath, 'plugin/pug'), { withFileTypes: true }).then((files)=>{
    let added: Set<string> = new Set();
    let options: any = {};
    files.forEach((dirent)=>{
      if (dirent.isFile() && ['.js', '.node'].includes(path.extname(dirent.name)) && !added.has(path.parse(dirent.name).name)) {
        added.add(path.parse(dirent.name).name);
        options = Object.assign(option, require(path.join(themePath, 'plugin/pug', path.parse(dirent.name).name))(options));
      }
    });
  });
}
async function generate(page: Page | Post) {
  let layout = path.join(themePath, 'layout', page.layout + '.pug');
  let layoutAccessable = await access(path.join(themePath, 'layout', page.layout + '.pug')).then(()=>true).catch(()=>false);
  if (!layoutAccessable) layout = path.join(themePath, 'layout', 'page.pug');
  let result = pug.renderFile(layout, Object.assign(globalOptions, options, {page}));
  await access(path.join(process.cwd(), 'out', page.url))
  .catch(()=>mkdir(path.join(process.cwd(), 'out', page.url), { recursive: true }));
  return await writeFile(path.join(process.cwd(), 'out', page.url, 'index.html'), result, 'utf8');
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
