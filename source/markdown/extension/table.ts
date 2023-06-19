import { markdownLine } from "../../markdown";

const table: MarkdownExtension = {
  name: 'table',
  level: 'block',
  priority: 0,
  start(src){
    return src.match(/(^|(?<=\n))\|( (.*?) \|)+\n\|( (:)?\-+(:?) \|)+(\n\|( (.*?) \|)+)*/)?.index;
  },
  match(src) {
    let matched = src.match(/(^|(?<=\n))\|( (.*?) \|)+\n\|( (:)?\-+(:?) \|)+(\n\|( (.*?) \|)+)*/);
    if (!matched) return;
    let raw = matched[0];
    let lines = raw.split('\n');
    let head = [];
    for (const item of lines[0].slice(1, lines[0].length - 1).split(' | ')) {
      head.push(item.trim());
    }
    let align = [];
    for (const item of lines[1].slice(1, lines[1].length - 1).split(' | ')) {
      if (/:\-+:/.test(item)) {
        align.push('center');
      }else if (/:\-+/.test(item)) {
        align.push('left');
      }else if (/\-+:/.test(item)) {
        align.push('right');
      }else{
        align.push(null);
      }
    }
    let body = [];
    for (let i = 2; i < lines.length; i++) {
      let line = [];
      for (const item of lines[i].slice(1, lines[i].length - 1).split(' | ')) {
        line.push(item.trim());
      }
      body.push(line);
    }
    return{
      raw,
      text: '',
      head,
      align,
      body,
    };
  },
  async render(matched, v){
    let head = '';
    head += '<tr>';
    for (let i = 0; i < matched.head.length; i++) {
      head += `<th${matched.align[i] ? ` align="${matched.align[i]}"` : ''}>${(await markdownLine(matched.head[i], v)).context}</th>`;
    }
    head += '</tr>';
    let body = '';
    for (let i = 0; i < matched.body.length; i++) {
      body += '<tr>';
      for (let j = 0; j < matched.body[i].length; j++) {
        body += `<th${matched.align[j] ? ` align="${matched.align[j]}"` : ''}>${(await markdownLine(matched.body[i][j], v)).context}</th>`;
      }
      body += '</tr>';
    }
    return`<table><thead>${head}</thead><tbody>${body}</tbody></table>`
  }
}
module.exports = table;
