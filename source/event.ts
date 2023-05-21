import { readdir } from "fs/promises"
import path from "path"

interface Listeners{
  'pre-render': Array<Function>,
  'post-render': Array<Function>,
  'generate': Array<Function>,
  'post-generate': Array<Function>,
  'post-assets': Array<Function>,
};
let parmas: any = {}
let listeners: Listeners = {
  'pre-render': [],
  'post-render': [],
  'generate': [],
  'post-generate': [],
  'post-assets': [],
};
const events = [
  'pre-render',
  'post-render',
  'generate',
  'post-generate',
  'post-assets',
];
function listListeners(event: 'pre-render' | 'post-render' | 'generate' | 'post-generate' | 'post-assets', themePath: string) {
  let added: Set<string> = new Set();
  return readdir(path.join(themePath, 'scripts', event), { withFileTypes: true }).then((files)=>{
    files.forEach((dirent)=>{
      if (dirent.isFile() && ['.js', '.node'].includes(path.extname(dirent.name)) && !added.has(path.parse(dirent.name).name)) {
        added.add(path.parse(dirent.name).name);
        listeners[event].push(require(path.join(themePath, 'scripts', event, path.parse(dirent.name).name)));
      }
    });
  });
}
async function initEvents(args: any, themePath: string) {
  parmas = args
  for (let i = 0; i < events.length; i++) {
    //@ts-ignore
    await listListeners(events[i], themePath)
  }
}
async function triggerListeners(event: 'pre-render' | 'post-render' | 'generate' | 'post-generate' | 'post-assets') {
  for (let i = 0; i < listeners[event].length; i++) {
    await listeners[event][i]();
  }
}

export {
  listeners,
  initEvents,
  triggerListeners,
};
