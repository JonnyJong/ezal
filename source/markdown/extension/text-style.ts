import { markdownLine } from '../../markdown';

type MarkdownExtension = import('../../markdown').MarkdownExtension;

const rule = {
  bold: /\*\*(.*)+\*\*/,
  italic: /\*(.*)+\*/,
  boldAndItalic: /\*\*\*(.*)+\*\*\*/,
  underscore: /__(.*)+__/,
  del: /~~(.*)+~~/,
};

const bold: MarkdownExtension = {
  name: 'bold',
  priority: 0,
  level: 'inline',
  start(src) {
    return src.match(rule.bold)?.index;
  },
  match(src) {
    let raw = src.match(rule.bold)?.[0];
    if (!raw || raw.includes('\n')) return;
    let text = raw.slice(2, raw.length - 2).trim();
    return{
      raw,
      text,
    };
  },
  async render(matched) {
    return `<b>${(await markdownLine(matched.text)).context}</b>`
  },
};
const italic: MarkdownExtension = {
  name: 'italic',
  priority: 0,
  level: 'inline',
  start(src) {
    return src.match(rule.italic)?.index;
  },
  match(src) {
    let raw = src.match(rule.italic)?.[0];
    if (!raw || raw.includes('\n')) return;
    let text = raw.slice(1, raw.length - 1).trim();
    return{
      raw,
      text,
    };
  },
  async render(matched) {
    return `<i>${(await markdownLine(matched.text)).context}</i>`
  },
}
const boldAndItalic: MarkdownExtension = {
  name: 'bold-italic',
  priority: 1,
  level: 'inline',
  start(src) {
    return src.match(rule.boldAndItalic)?.index;
  },
  match(src) {
    let raw = src.match(rule.boldAndItalic)?.[0];
    if (!raw || raw.includes('\n')) return;
    let text = raw.slice(3, raw.length - 3).trim();
    return{
      raw,
      text,
    };
  },
  async render(matched) {
    return `<i><b>${(await markdownLine(matched.text)).context}</b></i>`
  },
};
const underscore: MarkdownExtension = {
  name: 'underscore',
  priority: 0,
  level: 'inline',
  start(src) {
    return src.match(rule.underscore)?.index;
  },
  match(src) {
    let raw = src.match(rule.underscore)?.[0];
    if (!raw || raw.includes('\n')) return;
    let text = raw.slice(2, raw.length - 2).trim();
    return{
      raw,
      text,
    };
  },
  async render(matched) {
    return `<u>${(await markdownLine(matched.text)).context}</u>`
  },
};
const del: MarkdownExtension = {
  name: 'del',
  priority: 0,
  level: 'inline',
  start(src) {
    return src.match(rule.del)?.index;
  },
  match(src) {
    let raw = src.match(rule.del)?.[0];
    if (!raw || raw.includes('\n')) return;
    let text = raw.slice(2, raw.length - 2).trim();
    return{
      raw,
      text,
    };
  },
  async render(matched, v) {
    return `<del>${(await markdownLine(matched.text, v)).context}</del>`
  },
};

module.exports = [bold, italic, boldAndItalic, underscore, del];
