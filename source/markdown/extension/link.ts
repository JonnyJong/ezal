import { warn } from "../../console";
import { markdownLine } from "../../markdown";
type MarkdownExtensionVariables = import("../../markdown").MarkdownExtensionVariables;

const pointedBracketLink: MarkdownExtension = {
  name: 'pointed-bracket-link',
  level: 'inline',
  priority: 1,
  start(src){
    return src.match(/\<[<[a-zA-z]+:\/\/[\S]*|]\>/)?.index;
  },
  match(src) {
    let raw = src.match(/\<[<[a-zA-z]+:\/\/[\S]*|]\>/)?.[0];
    if (!raw) return;
    return{
      raw,
      text: raw.slice(1, raw.length - 1),
    };
  },
  render(matched){
    return`<a href="${matched.text}">${matched.text}</a>`
  }
}
const pointedBracketEmail: MarkdownExtension = {
  name: 'pointed-bracket-email',
  level: 'inline',
  priority: 1,
  start(src){
    return src.match(/\<[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?\>/)?.index;
  },
  match(src) {
    let raw = src.match(/\<[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?\>/)?.[0];
    if (!raw) return;
    return{
      raw,
      text: raw.slice(1, raw.length - 1),
    };
  },
  render(matched){
    return`<a href="mailto:${matched.text}">${matched.text}</a>`
  }
}
const link: MarkdownExtension = {
  name: 'link',
  level: 'inline',
  priority: 0,
  start(src){
    return src.match(/\[(.*)\]\((.*)\)/)?.index;
  },
  match(src) {
    let matched = src.match(/\[(.*)\]\((.*)\)/);
    if (!matched) return;
    let body = matched[2].split(' ');
    let link = body[0];
    let title = body[1];
    if (title && (/^"(.*)"$/.test(title) || /^'(.*)'$/.test(title))) {
      title = title.slice(1, title.length - 1);
    }
    return{
      raw: matched[0],
      text: matched[1],
      link,
      title,
    };
  },
  render(matched){
    return`<a href="${matched.link}"${matched.title ? ' title="' + matched.title + '"' : ''}>${markdownLine(matched.text)}</a>`;
  }
};
const quoteLink: MarkdownExtension = {
  name: 'quote-link',
  level: 'inline',
  priority: 0,
  start(src) {
    return src.match(/\[(.*)\][ ]?\[(.*)\]/)?.index;
  },
  match(src) {
    let matched = src.match(/\[(.*)\][ ]?\[(.*)\]/);
    if (!matched) return;
    if (matched[2].indexOf('^') === 0) return;
    return{
      raw: matched[0],
      text: matched[1],
      arg: matched[2],
    };
  },
  async render(matched, v) {
    let link = v?.markdown.quoteLink[(matched.arg as unknown as number)];
    if (!link) {
      warn(`Can not found quote link '${(matched.arg as unknown as number)}' in '${v?.page?.path}'`);
    }
    return`<a href="${link}">${(await markdownLine(matched.text)).context}</a>`;
  },
};
const quoteLinkSource: MarkdownExtension = {
  name: 'quote-link-source',
  level: 'block',
  priority: 0,
  start(src) {
    return src.match(/\[(.*)\]\: (.*)/)?.index;
  },
  match(src, v) {
    let matched = src.match(/\[(.*)\]\:(.*)/);
    if (!matched) return;
    if (matched[1].indexOf('^') === 0) return;
    let body = matched[2].split(' ');
    let id = matched[1]
    let link = body[0];
    let title = body[1];
    if (link.indexOf('<') === 0 && link.lastIndexOf('>') === link.length - 1) {
      link = link.slice(1, link.length - 1);
    }
    if (title) {
      if (/^"(.*)"$/.test(title) || /^'(.*)'$/.test(title) || /\<"(.*)\>$/.test(title)) {
        title = title.slice(1, title.length - 1);
      }
    }
    if (id in v?.markdown.quoteLink) {
      warn(`Same id '${id}' in '${v?.page?.path}', `);
    }
    (v as MarkdownExtensionVariables).markdown.quoteLink[id] = link;
    return{
      raw: matched[0],
      text: matched[2],
      args: [id, link, title],
    };
  },
  async render(matched) {
    return`<a href="${(matched.args as string[])[1]}">${(await markdownLine((matched.args as string[])[2] ? (matched.args as string[])[2] : (matched.args as string[])[1])).context}</a>`
  },
}
module.exports = [pointedBracketLink, pointedBracketEmail, link, quoteLink, quoteLinkSource];
