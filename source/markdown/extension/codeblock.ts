import { render } from "ezal";
type MarkdownExtensionVariables = import('../../markdown').MarkdownExtensionVariables;

const codeblock: MarkdownExtension = {
  name: 'codeblock',
  level: 'block',
  priority: 0,
  start(src) {
    return src.match(/(^|(?<=\n))(    |\t)(.*)(\n(    |\t)(.*))*/)?.index;
  },
  match(src) {
    let raw = src.match(/(^|(?<=\n))(    |\t)(.*)(\n(    |\t)(.*))*/)?.[0];
    if (!raw) return;
    let text = '';
    for (const line of raw.split('\n')) {
      text += '\n' + line.slice((line.match(/^(    |\t)/) as string[])[0].length);
    }
    return{
      raw,
      text: text.slice(1),
    };
  },
  render(matched, v) {
    return render.codeblock(matched, v);
  },
};
const fenceCodeblock: MarkdownExtension = {
  name: 'fence-codeblock',
  level: 'block',
  priority: 1,
  start(src) {
    return src.match(/(^|(?<=\n))(```|~~~)(.*)\n([\S\s]*?)\n(```|~~~)/)?.index;
  },
  match(src) {
    let matched = src.match(/(^|(?<=\n))(```|~~~)(.*)\n([\S\s]*?)\n(```|~~~)/);
    if (!matched) return;
    return{
      raw: matched[0],
      text: matched[4],
      arg: matched[3],
      args: matched[3].split(' '),
    };
  },
  render(matched, v) {
    return render.codeblock(matched, v);
  },
};
module.exports = [codeblock, fenceCodeblock];
