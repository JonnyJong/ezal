import { config } from "ezal";
import { warn } from "../../console";
import { markdown } from "../../markdown";

const footnote: MarkdownExtension = {
  name: 'footnote',
  level: 'inline',
  priority: 0,
  start(src){
    return src.match(/\[\^(.*?)\]/)?.index;
  },
  match(src){
    let matched = src.match(/\[\^(.*?)\]/);
    if (!matched) return;
    return{
      raw: matched[0],
      text: matched[1],
    };
  },
  render(matched, v){
    return`<a class="${config.markdown.footnote_classname}" href="#${v?.markdown.footnote[matched.text]}">${matched.text}</a>`;
  },
};
const footnoteSource: MarkdownExtension = {
  name: 'footnote-source',
  level: 'block',
  priority: 0,
  start(src){
    return src.match(/(^|(?<=\n))\[\^(.*)\]\: (.*)/)?.index;
  },
  match(src, v){
    let matched = src.match(/(^|(?<=\n))\[\^(.*)\]\: (.*)/);
    if (!matched) return;
    let lines = src.split('\n').slice();
    let text = matched[3] + '\n';
    let id = matched[2];
    let end = 0;
    for (const line of lines) {
      let space = line.match(/(  |\t)/);
      if (!space) break;
      end++;
      text += line.slice(space[0].length) + '\n';
    }
    let raw = matched[0] + '\n' + lines.slice(0, end).join('\n');
    let url = id;
    if (v?.markdown.anchors[id]) {
      url += '-' + v.markdown.anchors[id];
      v.markdown.anchors[id]++;
    }else{
      (v as any).markdown.anchors[id] = 0;
    }
    if (v?.markdown.footnote[id]) {
      warn(`Same footnote id '${id}' in '${v.page?.path}'`);
    }
    (v as any).markdown.footnote[id] = url;
    return{
      raw,
      text,
      id,
      url,
    };
  },
  async render(matched, v){
    return`<dl><dt id="#${matched.url}">${matched.id}</dt><dd>${(await markdown(matched.text, v)).context}</dd></dl>`;
  },
};
module.exports = [footnote, footnoteSource];
