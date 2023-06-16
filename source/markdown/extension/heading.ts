import { config } from "ezal";
import { warn } from "../../console";
import { HTMLEncode } from "ezal/source/util";
type MarkdownExtension = import('../../markdown').MarkdownExtension;
type MarkdownMatched = import('../../markdown').MarkdownMatched;
type MatchResult = MarkdownMatched | null | undefined | void

function sharpHeading(src: string, level: number): MatchResult {
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
}
function underlineHeading(src: string): MatchResult {
  let raw = src.match(/(.+)\n[=|\-]{3,}(\n)?/)?.[0];
  if (!raw) return;
  let lines = raw.split('\n')
  let underline = lines[1].split('')[0];
  if (lines[1].match(new RegExp('[' + underline + ']{3,}'))?.[0].length !== lines[1].length) return;
  let text = lines[0];
  let customId = text.match(/(?<= ){#[A-Za-z0-9|_|\-]+}/);
  if (customId) {
    text = text.slice(0, text.length - customId[0].length).trim();
  }
  return{
    raw,
    text,
    customId: customId ? customId[0].slice(2, customId[0].length - 1) : undefined,
    level: underline === '=' ? 2 : 1,
  }
}

export const heading: MarkdownExtension = {
  name: 'heading',
  priority: 0,
  level: 'block',
  start(src) {
    let a = src.match(/(^|(?<=\n))#{1,6} (.*)/)?.index;
    let b = src.match(/(.+)\n[=|\-]{3,}(\n)?/)?.index;
    if (typeof a !== 'number' && typeof b !== 'number') return;
    a = typeof a === 'number' ? a : Infinity;
    b = typeof b === 'number' ? b : Infinity;
    return Math.min(a, b);
  },
  match(src) {
    let level = src.match(/#{1,6}/)?.[0].length;
    if (level) return sharpHeading(src, level);
    return underlineHeading(src);
  },
  render(matched, v) {
    let anchor = matched.customId ? matched.customId : encodeURI(matched.text);
    if (v?.markdown.anchors[anchor]) {
      if (matched.customId) {
        warn(`Same anchor "${anchor}" in "${v?.page?.path}"`);
      }else{
        anchor += '-' + v?.markdown.anchors[anchor];
        (v as any).markdown.anchors[anchor]++;
      }
    }else{
      (v as any).markdown.anchors[anchor] = 0;
    }
    return `<h${matched.level} id="#${config.markdown.heading_anchor_prefix}">${HTMLEncode(matched.text)}</h${matched.level}>`;
  },
}

module.exports = heading;
