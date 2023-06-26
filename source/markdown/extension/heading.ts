import { config } from "ezal";
import { warn } from "../../console";
import { HTMLEncode } from "../../util";
type MarkdownExtension = import('../../markdown').MarkdownExtension;

function getCustomId(text: string) {
  let id = text.match(/(?<= ){#([A-Za-z0-9|_|\-]+)}/)?.[1];
  if (id) {
    return{
      text: text.slice(0, text.length - 4 - id.length),
      customId: id,
    };
  }
  return{
    text,
  };
}

function renderHeading(matched: any, v: any): string {
  let anchor = encodeURI(matched.text.toLowerCase().replace(/[^A-Za-z0-9 \-]/g,'').trim().replace(/ /g, '-').replace(/\-{2,}/g, '-'));
  if (matched.customId) {
    if (v.markdown.anchors[matched.customId]) {
      warn(`Same anchor "${anchor}" in "${v.page?.path}"`);
    }
    anchor = matched.customId;
  }else if (typeof v.markdown.anchors[anchor] === 'number') {
    v.markdown.anchors[anchor]++;
    anchor += '-' + v.markdown.anchors[anchor];
  }else{
    v.markdown.anchors[anchor] = 0;
  }
  if (v.page && (v.page.toc === undefined || v.page.toc === true || Array.isArray(v.page.toc))) {
    if (!Array.isArray(v.page.toc)) v.page.toc = [];
    v.page.toc.push({
      name: matched.text,
      id: config.markdown.heading_anchor_prefix + anchor,
      level: matched.level,
    });
  }
  return`<h${matched.level} id="${config.markdown.heading_anchor_prefix}${anchor}">${matched.text}</h${matched.level}>`;
}

const heading: MarkdownExtension = {
  name: 'heading',
  priority: 0,
  level: 'block',
  start(src) {
    return src.match(/(^|(?<=\n))#{1,6} (.*)/)?.index;
  },
  match(src) {
    let raw = src.match(/(^|(?<=\n))#{1,6} (.*)/)?.[0];
    if (!raw) return;
    let level = (src.match(/#{1,6}/) as string[])[0].length;
    let textOrigin = raw.slice(level)
    if (textOrigin.match(new RegExp('#{' + level + '}$'))) {
      textOrigin = textOrigin.slice(0, textOrigin.length - level);
    }
    textOrigin = textOrigin.trim();
    let {text, customId} = getCustomId(textOrigin);
    return{
      raw,
      text,
      level,
      customId,
    };
  },
  render(matched, v) {
    return renderHeading(matched, v);
  },
}

const headingUnderscore: MarkdownExtension = {
  name: 'heading-underscore',
  level: 'block',
  priority: 0,
  start(src){
    return src.match(/(^|(?<=\n))(\S+)\n([\-]{3,}|[\=]{3,})/)?.index;
  },
  match(src){
    let matched = src.match(/(^|(?<=\n))(\S+)\n([\-]{3,}|[\=]{3,})/);
    if (!matched) return;
    if (matched[2].match(/\-*/)?.[0].length === matched[2].length) return;
    let {customId, text} = getCustomId(matched[2]);
    return{
      raw: matched[0],
      text: text.trim(),
      customId,
      level: (matched[3].indexOf('=') === 0) ? 1 : 2,
    };
  },
  render(matched, v){
    return renderHeading(matched, v);
  }
}

module.exports = [heading, headingUnderscore];
