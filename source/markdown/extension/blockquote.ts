import { markdown } from '../../markdown';

type MarkdownExtension = import('../../markdown').MarkdownExtension;

const blockquote: MarkdownExtension = {
  name: 'blockquote',
  level: 'block',
  priority: 0,
  start(src) {
    return src.match(/(^|(?<=\n))\>(.+)(\n>(.+))*/)?.index;
  },
  match(src){
    let raw = src.match(/(^|(?<=\n))\>(.+)(\n>(.+))*/)?.[0];
    if (!raw) return;
    let text = '';
    raw.split('\n>').forEach((line)=>{
      if (line.indexOf(' >') === 0) {
        text += '\n' + line.slice(1);
      }else{
        text += '\n' + line;
      }
    });
    text = text.slice(3);
    return{
      raw,
      text,
    };
  },
  async render(matched, v){
    return `<blockquote>${(await markdown(matched.text, v, false)).context}</blockquote>`;
  }
};
module.exports = blockquote;
