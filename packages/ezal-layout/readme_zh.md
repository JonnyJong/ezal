[English](./readme.md) | 中文

# ezal-layout

支持 JSX/TSX 的异步 HTML 预处理器。

## 安装

```sh
pnpm install ezal-layout
yarn add ezal-layout
pnpm add ezal-layout
```

## 使用

```ts
import { compile } from 'ezal-layout';

const { renderer } = await compile(
  'path/to/template.tsx',
  { external: { title: 'Hello world!' } },
);

const html = await renderer('<h1>Title</h1>');
```

[文档](https://jonnyjong.github.io/ezal/docs/zh/ezal-layout/)
