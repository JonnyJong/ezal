type Page = import('./page').Page;
type Post = import('./page').Post;
import { access, readdir, writeFile } from 'fs/promises';
import path from 'path';
import pug from 'pug';

let globalOptions: any;
let options: any = {};
function initPug(option: any) {
  globalOptions = option
  return readdir(path.join(process.cwd(), 'plugin/pug'), { withFileTypes: true }).then((files)=>{
    let added: Set<string> = new Set();
    let options: any[] = [];
    files.forEach((dirent)=>{
      if (dirent.isFile() && ['.js', '.node'].includes(path.extname(dirent.name)) && !added.has(path.parse(dirent.name).name)) {
        added.add(path.parse(dirent.name).name);
        options = Object.assign(option, require(path.join(process.cwd(), 'plugin/pug', path.parse(dirent.name).name))(options));
      }
    });
  });
}
async function generate(page: Page | Post) {
  let layout = path.join(process.cwd(), 'layout', page.layout + '.pug');
  let layoutAccessable = await access(path.join(process.cwd(), 'layout', page.layout + '.pug')).then(()=>true).catch(()=>false);
  if (!layoutAccessable) layout = path.join(process.cwd(), 'layout', 'page.pug');
  let result = pug.renderFile(layout, Object.assign(globalOptions, options, {page}));
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
