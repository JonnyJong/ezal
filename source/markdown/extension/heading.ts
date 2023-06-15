import { config } from "ezal";
import { warn } from "../../console";
import { HTMLEncode } from "ezal/source/util";
type MarkdownExtension = import('../../markdown').MarkdownExtension;

export const ext: MarkdownExtension = {
  name: 'heading',
  level: 'block',
  start(src) {
    return src.match(/(?<=\n)#{1,6} (.*)/)?.index || src.match(/(?<!#)#{1,6} (.*)/)?.index;
  },
  match(src) {
    let level = src.match(/#{1,6}/)?.[0].length;
    if (!level) return;
    let raw = src.split('\n')[0];
    let text = raw.slice(level).trim();
    if (text.match(new RegExp('#{' + level + '}$'))) {
      text = text.slice(0, text.length - level).trim();
    }
    let customId = text.match(/(?<= ){#[A-Za-z0-9|_|\-]+}/);
    if (customId) {
      text = text.slice(0, text.length - customId[0].length).trim();
    }
    return{
      raw,
      text,
      customId: customId ? customId[0].slice(2, customId[0].length - 1) : undefined,
      level,
    };
  },
  render(matched, v) {
    let anchor = matched.customId ? matched.customId : encodeURI(matched.text);
    let target = (v?.markdown.headingAnchor as Array<{id: string, count: number}>).find(({id})=>id===anchor);
    if (target) {
      if (matched.customId) {
        warn(`Same anchor "${anchor}" in "${v?.page?.path}"`);
      }else{
        anchor += '-' + target.count++;
      }
    }else{
      (v?.markdown.headingAnchor as Array<{id: string, count: number}>).push({id: anchor, count: 1});
    }
    return `<h${matched.level} id="#${config.markdown.heading_anchor_prefix}">${HTMLEncode(matched.text)}</h${matched.level}>`;
  },
}

module.exports = ext;
