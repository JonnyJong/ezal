// import { readFile, writeFile } from "fs/promises";
// import path from "path";
import { warn } from "./console";
import { inlineTagRender, blockTagRender, setMarkdownTag } from "./markdown/tag";
import hljs from "highlight.js";
type EzalModule = import('./main').EzalModule;
type Page = import('./page').Page;
type Post = import('./page').Post;
export type MarkdownExtensionVariables = {
  page?: Page | Post,
  markdown: any,
};
export type MarkdownExtension = {
  name: string,
  level: 'block' | 'inline',
  start(src: string, v?: MarkdownExtensionVariables): number | null | undefined | void | Promise<number | null | undefined | void>,
  match(src: string, v?: MarkdownExtensionVariables): MarkdownMatched | null | undefined | void | Promise<MarkdownMatched | null | undefined | void>,
  render(matched: MarkdownMatched, v?: MarkdownExtensionVariables): string | Promise<string>,
  priority?: number,
};
export type MarkdownMatched = {
  raw: string,
  text: string,
  args?: string[],
  arg?: string,
  [x: string | number | symbol] : any,
};
type MarkdownExtensions = {
  inline: {
    [x: string]: MarkdownExtension
  },
  block: {
    [x: string]: MarkdownExtension
  },
};
type StartIndexes = Array<string[]>;
type Matcheds = Array<{
  name: string,
  matched: MarkdownMatched,
}>;

let extensions: MarkdownExtensions = {
  inline: {},
  block: {},
};

function getDefaultMarkdownV() {
  return{
    anchors: {},
    quoteLink: {},
    footnote: {},
  };
}

function setMarkdownExtension(exts: MarkdownExtension | MarkdownExtension[]) {
  if (typeof exts !== 'object') throw new Error('Need MarkdownExtension.');
  if (exts !instanceof Array) exts = [(exts as unknown as MarkdownExtension)];
  (exts as MarkdownExtension[]).forEach((ext)=>{
    if (!ext.name) throw new Error('MarkdownExtension need a name.');
    if (typeof ext.start !== 'function') throw new Error('MarkdownExtension\'s start should be a Function.');
    if (typeof ext.match !== 'function') throw new Error('MarkdownExtension\'s match should be a Function.');
    if (typeof ext.render !== 'function') throw new Error('MarkdownExtension\'s render should be a Function.');
    if (!['block', 'inline'].includes(ext.level)) throw new Error('Unexpected MarkdownExtension level.');
    if (!extensions[ext.level][ext.name] || !extensions[ext.level][ext.name].priority || (typeof ext.priority === 'number' && (extensions[ext.level][ext.name].priority as number) < ext.priority)) {
      extensions[ext.level][ext.name] = ext;
    }
  });
}

function loadBuildInExtension() {
  [
    'heading',
    'text-style',
    'blockquote',
    'list',
    'code',
    'codeblock',
    'hr',
    'link',
    'image',
    'escape',
    'html',
    'table',
    'footnote',
    'dl',
    'task',
    'emoji',
  ].forEach((name)=>{
    setMarkdownExtension(require('./markdown/extension/' + name));
  });
}

export function init(ezalModule: EzalModule) {
  ezalModule.setMarkdownExtension = setMarkdownExtension;
  ezalModule.setMarkdownTag = setMarkdownTag;
  extensions.inline['tag'] = inlineTagRender;
  extensions.block['tag'] = blockTagRender;
  loadBuildInExtension();
  ezalModule.render.codeblock = function render(matched: MarkdownMatched, _v: MarkdownExtensionVariables) {
    let lang = (matched.args && matched.args[0]) ? [matched.args[0]] : undefined;
    let result = hljs.highlightAuto(matched.text, lang);
    return`<pre><code class="${ezalModule.config.markdown.highlight_prefix}${result.language}"></code>${result.value}</pre>`
  };
}

async function matchBlocks(source: string, markdownV: any, lines: string[], page: Page | Post | void) {
  let starts: StartIndexes = [];
  let matcheds: Matcheds = [];
  for (const name in extensions.block) {
    let str = source;
    let offset = 0;
    while (Object.prototype.hasOwnProperty.call(extensions.block, name)) {
      let index = await extensions.block[name].start(source, { page: page ? page : undefined, markdown: markdownV });
      if (typeof index !== 'number' || index < 0) break;
      if (starts[index + offset]) {
        starts[index + offset].push(name);
      }else{
        starts[index + offset] = [name];
      }
      str = str.slice(index + 1);
      offset += index + 1;
    }
  }
  starts.forEach((start)=>{
    start.sort((a, b)=>(extensions.block[a].priority || 0) - (extensions.block[b].priority || 0));
  });
  for (let i = 0; i < starts.length; i++) {
    if (!starts[i]) continue;
    for (const name of starts[i]) {
      let matched = await extensions.block[name].match(source.slice(i), { page: page ? page : undefined, markdown: markdownV });
      if (!matched) continue;
      matcheds[i] = {
        matched,
        name,
      };
      for (let j = 0; j < matched.raw.length; j++) {
        delete starts[i + j];
      }
      let lineStart = source.slice(0, i).split('\n').length;
      let lineEnd = source.slice(0, i + matched.raw.length).split('\n').length;
      for (let j = lineStart; j < lineEnd; j++){
        delete lines[j];
      }
      break;
    }
  }
  return matcheds;
}
async function matchLines(source: string, markdownV: any, lines: string[], page: Page | Post | void) {
  let matcheds: Matcheds[] = [];
  for (let i = 0; i < lines.length; i++) {
    if (typeof lines[i] !== 'string') continue;
    let starts: StartIndexes = [];
    let lineMatcheds: Matcheds = [];
    for (const name in extensions.inline) {
      let str = source;
      let offset = 0;
      while (Object.prototype.hasOwnProperty.call(extensions.inline, name)) {
        let index = await extensions.inline[name].start(lines[i], { page: page ? page : undefined, markdown: markdownV });
        if (typeof index !== 'number' || index < 0) continue;
        if (starts[index + offset]) {
          starts[index + offset].push(name);
        }else{
          starts[index + offset] = [name];
        }
        str = str.slice(index + 1);
        offset += index + 1;
      }
    }
    starts.forEach((start)=>{
      start.sort((a, b)=>(extensions.inline[a].priority || 0) - (extensions.inline[b].priority || 0));
    });
    for (let i = 0; i < starts.length; i++) {
      if (!starts[i]) continue;
      for (const name of starts[i]) {
        let matched = await extensions.inline[name].match(lines[i], { page: page ? page : undefined, markdown: markdownV });
        if (!matched) continue;
        lineMatcheds[i] = {
          matched,
          name,
        };
        for (let j = 0; j < matched.raw.length; j++) {
          delete starts[i + j];
        }
        break;
      }
    }
    matcheds.push(lineMatcheds);
  }
  return matcheds;
}

export async function markdownLine(source: string, v: MarkdownExtensionVariables | null | undefined | void = {markdown: getDefaultMarkdownV()}) {
  source = source.replace(/\r/g, '');
  let lines = source.split('\n');
  if (lines.length > 1) {
    warn('markdownLine receives two or more lines of source and only render the first line.');
  }
  let line = lines[0].trim();
  let inlineMatcheds = await matchLines(line, v?.markdown, [line], v?.page);
  let context = '';
  if (inlineMatcheds[0] && inlineMatcheds[0].length > 0){
    let charBegin = 0
    // j: index of char in line
    for (let j = 0; j < inlineMatcheds[0].length; j++) {
      if (!inlineMatcheds[0][j]) continue;
      line += lines[0].slice(charBegin, j);
      charBegin = inlineMatcheds[0][j].matched.raw.length + j;
      line += await extensions.inline[inlineMatcheds[0][j].name].render(inlineMatcheds[0][j].matched, { page: v?.page, markdown: v?.markdown });
      j = charBegin;
    }
    context += line;
  } else {
    context = line;
  }
  return { context, variables: markdown };
}

export async function markdown(source: string, v: MarkdownExtensionVariables | null | undefined | void = {markdown: getDefaultMarkdownV()}) {
  source = source.replace(/\r/g, '');
  let lines = source.split('\n');
  let blockMatcheds: Matcheds = await matchBlocks(source, v?.markdown, lines, v?.page);
  let inlineMatcheds = await matchLines(source, v?.markdown, lines, v?.page);
  let context = '';
  let partBegin = false;
  // i: index of line in source
  for (let i = 0; i < lines.length; i++) {
    if (typeof lines[i] !== 'string') {
      if (partBegin) {
        context += '</p>';
        partBegin = false;
      }
      context += await extensions.block[blockMatcheds[i].name].render(blockMatcheds[i].matched, { page: v?.page, markdown: v?.markdown });
      continue;
    }
    if (lines[i] === '') {
      if (partBegin) {
        context += '</p>';
        partBegin = false;
      }
      continue;
    }
    if (!partBegin) {
      context += '<p>';
      partBegin = true;
    }else{
      context += '<br>'
    }
    let line = ''
    if (inlineMatcheds[i] && inlineMatcheds[i].length > 0) {
      let charBegin = 0
      // j: index of char in line
      for (let j = 0; j < inlineMatcheds[i].length; j++) {
        if (!inlineMatcheds[i][j]) continue;
        line += lines[i].slice(charBegin, j);
        charBegin = inlineMatcheds[i][j].matched.raw.length + j;
        line += await extensions.inline[inlineMatcheds[i][j].name].render(inlineMatcheds[i][j].matched, { page: v?.page, markdown: v?.markdown });
        j = charBegin;
      }
      context += line;
      continue;
    }
    context += lines[i];
  }
  if (partBegin) {
    context += '</p>';
  }
  return { context, variables: markdown };
}

// TODO: for test, delete later
// @ts-ignore
// readFile(path.join(process.cwd(), 'test', 'source.md'), 'utf-8').then(markdown).then(context=>{
//   return writeFile(path.join(process.cwd(), 'test', 'result.html'), context, 'utf-8');
// });
