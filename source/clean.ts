import { readdirSync, rmdirSync, unlinkSync } from "fs";
import path from "path";

const outBase = path.join(process.cwd(), 'out')

export default function clean(dir: string = outBase) {
  let files = readdirSync(dir, { withFileTypes: true, });
  files.forEach((dirent)=>{
    let target = path.join(dir, dirent.name);
    if (dirent.isFile()) {
      unlinkSync(target);
    }else if (dirent.isDirectory()) {
      clean(target);
    }
  });
  if (dir !== outBase) {
    rmdirSync(dir)
  }
}
