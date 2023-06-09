import { renderPug } from "./generate";
import { warn } from "./console";
import path from "path";
type Procedural = import('ezal').Procedural;
type ProceduralItem = import('ezal').ProceduralItem;
let procedural: Procedural[] = [];
function warnItem(item: any){
  warn(`${item} is not a correct Procedural`);
}
export function setProceduralGenerater(items: Procedural | Procedural[]): void{
  if (!items) return;
  if (!Array.isArray(items)) items = [items];
  items.forEach((item)=>{
    switch (item.type) {
      case 'assets':
        if (typeof item.dataType !== 'string') {
          warnItem(item);
          return
        }
        break;
      case 'page':
        if (typeof item.layout !== 'string') {
          warnItem(item);
          return
        }
        break;
      default:
        warnItem(item);
        return;
    }
    if (typeof item.match !== 'function' || typeof item.getItems !== 'function') {
      warnItem(item);
      return;
    }
    procedural.push(item);
  });
}
let dispatchEvent: Function;
async function generateProcedural(origin: Procedural, item: ProceduralItem){
  const { writeFile } = require('ezal').util;
  switch (origin.type) {
    case 'assets':
      return writeFile(path.join(process.cwd(), 'out', item.path), item.data, origin.dataType);
    case 'page':
      if (item.data.page) {
        item.data.page.url = item.path;
      }else{
        item.data.page = {url: item.path};
      }
      await dispatchEvent('pre-generate', item.data.page);
      let generated = { page: item.data.page, html: '' };
      generated.html = await renderPug((origin.layout as string), item.data);
      await dispatchEvent('post-generate', generated);
      return writeFile(path.join(process.cwd(), 'out', item.path), generated.html, 'utf-8');
  }
}
function verifyUrl(expectation: string, actual: string): boolean {
  if (expectation === actual) return true;
  if (expectation + 'index.html' === actual) return true;
  return false;
}
export async function findProcedural(url: string){
  for (const item of procedural) {
    let matched = await item.match(url);
    if (matched && verifyUrl(url, matched.path)) {
      return{item: matched, origin: item};
    }
  }
  return null;
}
export async function generateAllProcedural(){
  for (const origin of procedural) {
    let items = await origin.getItems();
    if (!Array.isArray(items)) items = [items];
    for (const item of items) {
      await generateProcedural(origin, item);
    }
  }
}
export async function autoGenerateProcedural(url: string){
  let target = await findProcedural(url);
  if (!target) return;
  return generateProcedural(target.origin, target.item);
}
export function initProcedural(fn: Function) {
  dispatchEvent = fn;
}
