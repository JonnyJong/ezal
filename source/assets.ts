import { readdirSync } from "fs";
import { access, copyFile, mkdir } from "fs/promises";
import path from "path";

const assetsBase = path.join(process.cwd(), 'assets')

function readFiles(dir: string) {
  let result: Array<string> = [];
  readdirSync(dir, { withFileTypes: true }).forEach((dirent)=>{
    if (dirent.isFile()) {
      result.push(path.join(dir, dirent.name));
    }else if (dirent.isDirectory()) {
      result = result.concat(readFiles(path.join(dir, dirent.name)));
    }
  });
  return result;
}

async function copy(from: string, to: string) {
  return access(path.dirname(to)).catch(()=>{
    return mkdir(path.dirname(to), { recursive: true });
  }).then(()=>{
    return copyFile(from, to);
  });
}

async function copyAssets(themeName: string) {
  await dispatchEvent('pre-assets');
  let themeAssetsBase = path.join(process.cwd(), 'themes', themeName, 'assets');
  let files = readFiles(assetsBase);
  let themeFiles = readFiles(themeAssetsBase);
  for (const file of themeFiles) {
    await copy(file, path.join(process.cwd(), 'out', file.replace(themeAssetsBase, '')));
  }
  for (const file of files) {
    await copy(file, path.join(process.cwd(), 'out', file.replace(assetsBase, '')));
  }
  await dispatchEvent('post-assets');
  return;
}

let dispatchEvent: Function;
function initAssets(eventDispatcher: Function) {
  dispatchEvent = eventDispatcher;
}

export {
  initAssets,
  copyAssets,
};
