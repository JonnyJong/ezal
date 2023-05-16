import { mkdir, writeFile } from "fs/promises";
import path from "path";

const dirs = [
  'assets',
  'layout',
  'plugin/marked',
  'plugin/pug',
  'plugin/stylus',
  'scripts/generate',
  'scripts/post-assets',
  'scripts/post-generate',
  'scripts/post-render',
  'scripts/pre-render',
  'pages',
  'posts',
  'style',
  'template',
];

const files = {
  'config.yml': '',
  'template/page.md': `---
  title: $title$
  date: $date$
  updated: $date$
  ---`,
  'template/post.md': `---
  title: $title$
  date: $date$
  updated: $date$
  categories:
  tags:
  ---`,
};

export default async function init () {
  for (let i = 0; i < dirs.length; i++) {
    await mkdir(path.join(process.cwd(), dirs[i]), { recursive: true, });
  }
  for (const key in files) {
    if (Object.prototype.hasOwnProperty.call(files, key)) {
      // @ts-ignore
      await writeFile(path.join(process.cwd(), key), files[key], 'utf8');
    }
  }
}
