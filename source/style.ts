import { readdirSync } from "fs";
import { access, mkdir, readFile, readdir, writeFile } from "fs/promises";
import path from "path";
import stylus from "stylus";

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
let options: any = {};
let themePath: string;
function initStylus(option: any, themeDir: string) {
  styleBase = path.join(themeDir, 'style');
  globalOptions = option;
  themePath = themeDir
  return readdir(path.join(themePath, 'plugin/stylus'), { withFileTypes: true }).then((files)=>{
    let added: Set<string> = new Set();
    let options: any[] = [];
    files.forEach((dirent)=>{
      if (dirent.isFile() && ['.js', '.node'].includes(path.extname(dirent.name)) && !added.has(path.parse(dirent.name).name)) {
        added.add(path.parse(dirent.name).name);
        options = Object.assign(option, require(path.join(themePath, 'plugin/stylus', path.parse(dirent.name).name))(options));
      }
    });
  });
}
async function generateStyle() {
  let files = readFiles(path.join(themePath, 'style'));
  for (let i = 0; i < files.length; i++) {
    let stylusContext = await readFile(files[i], 'utf-8')
    let cssContext = await stylus.render(stylusContext, {
      paths: [path.dirname(files[i])],
      filename: path.basename(files[i]),
      globals: Object.assign(globalOptions, options),
    });
    await access(path.join(process.cwd(), 'out/style', path.dirname(files[i].replace(styleBase, ''))))
    .catch(()=>mkdir(path.join(process.cwd(), 'out/style', path.dirname(files[i].replace(styleBase, ''))), { recursive: true }));
    await writeFile(path.join(process.cwd(), 'out/style', path.dirname(files[i].replace(styleBase, '')), path.parse(files[i].replace(styleBase, '')).name + '.css'), cssContext, 'utf8');
  }
}

export {
  initStylus,
  generateStyle,
};
