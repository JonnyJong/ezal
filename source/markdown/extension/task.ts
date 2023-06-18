import { config } from "ezal";
import { markdownLine } from "../../markdown";

const task: MarkdownExtension = {
  name: 'task',
  level: 'block',
  priority: 0,
  start(src){
    // return src.match(/\- \[(\S|\s)\] (.*)(\n(  |\t|\- \[(\S|\s)\] )(.*))*/)?.index;
    return src.match(/(^|(?<=\n))\- \[(\S|\s)\] (.*)(\n\- \[(\S|\s)\] (.*))*/)?.index;
  },
  match(src){
    // let raw = src.match(/\- \[(\S|\s)\] (.*)(\n(  |\t|\- \[(\S|\s)\] )(.*))*/)?.[0];
    let raw = src.match(/(^|(?<=\n))\- \[(\S|\s)\] (.*)(\n\- \[(\S|\s)\] (.*))*/)?.[0];
    if (!raw) return;
    let items: Array<[boolean, string]> = [];
    raw.split('\n').forEach((line)=>{
      let matched = line.match(/\- \[(\S|\s)\] (.*)/);
      items.push([matched?.[1] !== '', (matched?.[2] as string)]);
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
      html += `<li><input type="checkbox"${item[0] ? ' checked' : ''} disabled>${(await markdownLine(item[1], v)).context}</li>`;
    }
    return`<ul${config.markdown.task_list_classname ? ` class="${config.markdown.task_list_classname}"` : ''}>${html}</ul>`;
  },
};
module.exports = task;
