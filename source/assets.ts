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

async function copyAssets() {
  let files = readFiles(assetsBase);
  for (let i = 0; i < files.length; i++) {
    files[i]
    await copy(files[i], path.join(process.cwd(), 'out', files[i].replace(assetsBase, '')))
  }
  return
}

export {copyAssets}