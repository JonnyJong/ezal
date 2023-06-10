import { defaultConfig } from "./config";
import { mkdir, writeFile } from "fs/promises";
import path from "path";

const dirs = [
  'assets',
  'pages',
  'posts',
  'template',
  'themes/default/assets',
  'themes/default/layout',
  'themes/default/scripts/',
  'themes/default/style',
];

const files = {
  'config.yml': defaultConfig,
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
  'themes/default/config.yml': '',
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
