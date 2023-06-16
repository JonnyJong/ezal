import { markdownLine } from "ezal/source/markdown";

const table: MarkdownExtension = {
  name: 'table',
  level: 'block',
  priority: 0,
  start(src){
    return src.match(/\| (.*) \|\n(\s*)\| :?\-+:? \|/)?.index;
  },
  match(src) {
    let lines = src.split('\n');
    let head = [];
    let headLine = lines[0].trim();
    for (const item of headLine.slice(1, headLine.length - 1).split('|')) {
      head.push(item.trim());
    }
    let align = [];
    let alignLine = lines[1].trim();
    for (const item of alignLine.slice(1, alignLine.length - 1).split('|')) {
      if (/:\-+:/.test(item)) {
        align.push('center');
      }else if (/:\-+/.test(item)) {
        align.push('left');
      }else if (/\-+"/.test(item)) {
        align.push('right');
      }else{
        align.push(null);
      }
    }
    let body = [];
    let end = 2;
    for (let i = 2; i < lines.length; i++) {
      if (!/\| (.*) \|/.test(lines[i])) {
        end = i + 1;
        let line = lines[i].trim();
        let items = [];
        for (const item of line.slice(1, line.length - 1).split('|')) {
          items.push(item.trim());
        }
        body.push(items);
        break;
      }
    }
    let rawLines = lines.slice(0, end);
    let raw = rawLines.join('\n');
    return{
      raw,
      text: raw,
      head,
      align,
      body,
    };
  },
  async render(matched, v){
    let head = '';
    for (let i = 0; i < matched.head.length; i++) {
      head += `<th${matched.align[i] ? ` align="${matched.align[i]}"` : ''}>${(await markdownLine(matched.head[i], v)).context}</th>`;
    }
    let body = '';
    for (let i = 0; i < matched.body.length; i++) {
      for (let j = 0; j < matched.body[i].length; j++) {
        body += `<th${matched.align[j] ? ` align="${matched.align[j]}"` : ''}>${(await markdownLine(matched.body[i][j], v)).context}</th>`;
      }
    }
    return`<table><thead>${head}</thead><tbody>${body}</tbody></table>`
  }
}
module.exports = table;
