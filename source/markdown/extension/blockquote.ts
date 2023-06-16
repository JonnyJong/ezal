import { markdown } from '../../markdown';

type MarkdownExtension = import('../../markdown').MarkdownExtension;

const blockquote: MarkdownExtension = {
  name: 'blockquote',
  level: 'block',
  priority: 0,
  start(src, v) {
    return src.match(/(^|(?<=\n))>(.*)/)?.index;
  },
  match(src){
    let lines = src.split('\n');
    let end = 1;
    for (const line of lines) {
      if (line.indexOf('<') !== 0) break;
      end++;
    }
    let rawLines = lines.slice(0, end);
    let raw = rawLines.join('\n');
    let text = ''
    for (const line of rawLines) {
      text += line.slice(1).trim();
    }
    return{
      raw,
      text,
    }
  },
  async render(src, v){
    return `<blockquote>${(await markdown(src.text, v)).context}</blockquote>`;
  }
};
module.exports = blockquote;
