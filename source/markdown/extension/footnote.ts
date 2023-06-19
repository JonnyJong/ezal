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
    return`<a class="${config.markdown.footnote_classname}" href="#${v.markdown.footnote[matched.text]}">${matched.text}</a>`;
  },
};
function getFootnoteUrl(id: string, v: any) {
  let url = id;
  if (v.markdown.anchors[id]) {
    v.markdown.anchors[id]++;
    url += '-' + v.markdown.anchors[id];
  }else{
    v.markdown.anchors[id] = 0;
  }
  if (v.markdown.footnote[id]) {
    warn(`Same footnote id '${id}' in '${v.page?.path}'`);
  }
  v.markdown.footnote[id] = url;
  return url;
}
const footnoteSource: MarkdownExtension = {
  name: 'footnote-source',
  level: 'block',
  priority: 0,
  start(src){
    return src.match(/(^|(?<=\n))\[\^(.*)\]\: (.*)(\n(  |\t)(.*))*(\n\[\^(.*)\]\: (.*)(\n(  |\t)(.*))*)*/)?.index;
  },
  match(src, v){
    let raw = src.match(/(^|(?<=\n))\[\^(.*)\]\: (.*)(\n(  |\t)(.*))*(\n\[\^(.*)\]\: (.*)(\n(  |\t)(.*))*)*/)?.[0];
    if (!raw) return;
    let items = [];
    let item = {text: '', id: '', url: ''};
    for (const line of raw.split('\n')) {
      let lineMatched = line.match(/^\[\^(.*)\]: (.*)/);
      if (lineMatched) {
        item = {text: lineMatched[2], id: lineMatched[1], url: getFootnoteUrl(lineMatched[1], v)};
        items.push(item);
        continue;
      }
      item.text += '\n' + line;
    }
    return{
      raw,
      text: '',
      items,
    };
  },
  async render(matched, v){
    let html = '';
    for (const item of matched.items) {
      html += `<dt id=""${item.url}>${item.id}</dt><dd>${(await markdown(item.text, v, false)).context}</dd>`;
    }
    return`<dl>${html}</dl>`;
  },
};
module.exports = [footnote, footnoteSource];
