import { markdown, markdownLine } from "../../markdown";

const dl: MarkdownExtension = {
  name: 'dl',
  level: 'block',
  priority: 0,
  start(src){
    return src.match(/(^|(?<=\n))(.*)(\n: (.*))+(\n(.*)(\n: (.*))+)*/)?.index;
  },
  match(src){
    let matched = src.match(/(^|(?<=\n))(.*)(\n: (.*))+(\n(.*)(\n: (.*))+)*/);
    if (!matched) return;
    let raw = matched[0];
    let items: any = [];
    let item = {head:'',body:''};
    raw.split('\n').forEach((line)=>{
      if (line.indexOf(': ') === 0) {
        item.body += line.slice(2) + '\n';
      }else{
        item = {head:line,body:''};
        items.push(item);
      }
    });
    return{
      raw,
      text: '',
      items,
    };
  },
  async render(matched, v) {
    let html = '';
    for (const item of matched.items) {
      html += `<dt>${(await markdownLine(item.head, v)).context}</dt><dd>${(await markdown(item.body, v, false)).context}</dd>`;
    }
    return`<dl>${html}</dl>`;
  },
};
module.exports = dl;
