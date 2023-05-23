import { readdirSync } from "fs";
import path from "path";

function readFiles(dir: string) {
  let added: Set<string> = new Set();
  let result: Array<string> = [];
  readdirSync(dir, { withFileTypes: true }).forEach((dirent)=>{
    if (dirent.name.indexOf('_') === 0) return;
    let scriptName = path.join(dir, path.parse(dirent.name).name);
    if (dirent.isFile() && ['.js', '.node'].includes(path.extname(dirent.name)) && !added.has(scriptName)) {
      result.push(scriptName);
      added.add(scriptName);
    }else if (dirent.isDirectory()) {
      result = result.concat(readFiles(path.join(dir, dirent.name)));
    }
  });
  return result;
}

async function loadScript(themePath:string) {
  let scripts = readFiles(path.join(themePath, './scripts/'));
  for (const scriptPath of scripts) {
    let script = require(scriptPath);
    if (typeof script !== 'function') continue;
    await script();
  }
}

export {
  loadScript,
};
