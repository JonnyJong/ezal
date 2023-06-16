import { render } from "ezal";
type MarkdownExtensionVariables = import('../../markdown').MarkdownExtensionVariables;

const codeblock: MarkdownExtension = {
  name: 'codeblock',
  level: 'block',
  priority: 0,
  start(src) {
    return src.match(/(^|(?<=\n))[    |\t]{1}(.*)\n/)?.index;
  },
  match(src) {
    let lines = src.split('\n');
    let end = 1;
    for (const line of lines) {
      if (line.match(/(    |\t)/)?.index !== 0) break;
      end++;
    }
    let rawLines = lines.slice(0, end);
    let raw = rawLines.join('\n');
    let text = '';
    for (const line of rawLines) {
      text += line.slice(line.match(/(    |\t)/)?.[0].length);
    }
    return{
      raw,
      text,
    };
  },
  render(matched, v) {
    return render.codeblock(matched, (v as MarkdownExtensionVariables));
  },
};
const fenceCodeblock: MarkdownExtension = {
  name: 'fence-codeblock',
  level: 'block',
  priority: 0,
  start(src) {
    return src.match(/(^|(?<=\n))[```|~~~]{1}(.*)/)?.index;
  },
  match(src) {
    let lines = src.split('\n');
    let symbol = lines[0].split('\n')[0];
    let end = lines.indexOf(symbol + symbol + symbol);
    if (!end) return;
    let raw = lines.slice(0, end + 1).join('\n');
    let text = lines.slice(1, end).join('\n');
    let arg = lines[0].slice(3);
    let args = arg.split(' ');
    return {
      raw,
      text,
      arg,
      args,
    };
  },
  render(matched, v) {
    return render.codeblock(matched, (v as MarkdownExtensionVariables));
  },
};
module.exports = [codeblock, fenceCodeblock];
