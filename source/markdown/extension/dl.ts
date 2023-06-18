import { markdown, markdownLine } from "../../markdown";

const dl: MarkdownExtension = {
  name: 'dl',
  level: 'block',
  priority: 0,
  start(src){
    /* return src.match(/(^|(?<=\n))(.*)(\n: (.*))+/)?.index; */
    return src.match(/(^|(?<=\n))(.*)(\n: (.*))+(\n(.*)(\n: (.*))+)*/)?.index;
  },
  match(src){
    /* let matched = src.match(/(^|(?<=\n))(.*)(\n: (.*))+/);
    if (!matched) return;
    let raw = matched[0];
    let head = matched[2];
    let text = raw.split('\n: ').slice(1).join('\n');
    return{
      raw,
      text,
      head,
    }; */
    let matched = src.match(/(^|(?<=\n))(.*)(\n: (.*))+(\n(.*)(\n: (.*))+)*/);
    if (!matched) return;
    let raw = matched[0];
    let items = [];
    let item = {head:'',body:''};
    items.push(item);
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
      text: raw,
      items,
    };
  },
  async render(matched, v) {
    let html = '';
    for (const item of matched.items) {
      html += `<dt>${(await markdownLine(item.head, v)).context}</dt><dd>${(await markdown(item.body, v)).context}</dd>`;
    }
    return`<dl>${html}</dl>`;
  },
};
module.exports = dl;
