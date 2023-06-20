import { access, readFile } from "fs/promises";
import path from "path";
import { parse } from "yaml";

export async function getLocale(lang: string, themePath: string) {
  return access(path.join(themePath, 'locales', lang + '.yml')).then(()=>{
    return readFile(path.join(themePath, 'locales', lang + '.yml'), 'utf-8').then(parse);
  }).catch(()=>{
    return readFile(path.join(themePath, 'locales', 'default.yml'), 'utf-8').then(parse);
  }).catch(()=>{
    return {};
  });
}
