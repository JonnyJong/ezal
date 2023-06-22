import { renderPug } from "./generate";
import { warn } from "./console";
import { writeFile } from "./util";
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
function generateProcedural(origin: Procedural, item: ProceduralItem){
  switch (origin.type) {
    case 'assets':
      return writeFile(item.path, item.data, origin.dataType);
    case 'page':
      return writeFile(item.path, renderPug((origin.layout as string), item.data), 'utf-8');
  }
}
export async function findProcedural(url: string){
  for (const item of procedural) {
    let matched = await item.match(url);
    if (matched && matched.path === url) {
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
