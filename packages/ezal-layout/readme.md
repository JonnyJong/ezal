English | [中文](./readme_zh.md)

# ezal-layout

Asynchronous HTML Preprocessor with JSX/TSX.

## Install

```sh
pnpm install ezal-layout
yarn add ezal-layout
pnpm add ezal-layout
```

## Usage

```ts
import { compile } from 'ezal-layout';

const { renderer } = await compile(
  'path/to/template.tsx',
  { external: { title: 'Hello world!' } },
);

const html = await renderer('<h1>Title</h1>');
```

[docs](https://jonnyjong.github.io/ezal/docs/en/ezal-layout/)
