type MarkdownExtension = import('../markdown').MarkdownExtension;
type MarkdownMatched = import('../markdown').MarkdownMatched;
type MarkdownExtensionVariables = import('../markdown').MarkdownExtensionVariables;
type MarkdownTag = {
  name: string,
  level: 'block' | 'inline',
  render(matched: MarkdownMatched, v?: MarkdownExtensionVariables): string | Promise<string>,
  priority?: number,
};
type MarkdownTags = {
  inline: {
    [x: string]: MarkdownTag
  },
  block: {
    [x: string]: MarkdownTag
  },
}
let tags: MarkdownTags = {
  inline: {},
  block: {},
};

let inlineTagRender: MarkdownExtension = {
  name: 'tag',
  level: 'inline',
  start(src) {
    return src.match(/{% [A-Za-z]+\d* (.*)%}/)?.index;
  },
  match(src) {
    let end = src.indexOf('%}');
    if (end === -1) return;
    let text = src.slice(3, end).trim();
    let type = text.split(' ')[0].match(/[A-Za-z]+/)?.[0];
    if (!type || !tags.inline[type]) return;
    let args = text.split(' ').slice(1);
    return{
      raw: src.slice(0, end + 2),
      text,
      arg: args.join(' '),
      args,
      type,
    };
  },
  render(matched, v) {
    return tags.inline[matched.type].render(matched, v);
  },
}
let blockTagRender: MarkdownExtension = {
  name: 'tag',
  level: 'block',
  start(src) {
    return src.match(/{% [A-Za-z]+\d* (.*)%}\n/)?.index;
  },
  match(src) {
    let first = src.split('\n')[0];
    let label = first.slice(3).split(' ')[0];
    let type = label.match(/[A-Za-z]+/)?.[0];
    if (!type || !tags.block[type]) return;
    let endStr = '\n{% end' + label + ' %}';
    let end = src.indexOf(endStr);
    if (end === -1) return;
    let text = src.slice(first.length, end).trim();
    let args = first.slice(3, first.length - 2).trim().split(' ').slice(1);
    return{
      raw: src.slice(0, end + endStr.length),
      text,
      arg: args.join(' '),
      args,
      type,
    };
  },
  render(matched, v) {
    return tags.block[matched.type].render(matched, v);
  },
}

function setMarkdownTag(exts: MarkdownTag | MarkdownTag[]) {
  if (typeof exts !== 'object') throw new Error('Need MarkdownTag.');
  if (exts !instanceof Array) exts = [(exts as unknown as MarkdownTag)];
  (exts as MarkdownTag[]).forEach((ext)=>{
    if (!ext.name) throw new Error('MarkdownTag need a name.');
    if (ext.name !== ext.name.match(/[A-Za-z]+/)?.[0]) throw new Error('MarkdownTag name should only use A-Z and a-z.');
    if (typeof ext.render !== 'function') throw new Error('MarkdownTag\'s render should be a Function.');
    if (!['block', 'inline'].includes(ext.level)) throw new Error('Unexpected MarkdownTag level.');
    if (!tags[ext.level][ext.name] || !tags[ext.level][ext.name].priority || (typeof ext.priority === 'number' && (tags[ext.level][ext.name].priority as number) < ext.priority)) {
      tags[ext.level][ext.name] = ext;
    }
  });
}

export {
  inlineTagRender,
  blockTagRender,
  setMarkdownTag,
};
