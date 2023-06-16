const rule = {
  markdown: /(\\\\|\\`|\\\*|\\_|\\\{|\\\}|\\\[|\\\]|\\\(|\\\)|\\#|\\\+|\\\-|\\\.|\\\!|\\\|){1}/,
  html: /[\<>&]{1}/,
}
const escapeMarkdown: MarkdownExtension = {
  name: 'escape',
  level: 'inline',
  priority: 0,
  start(src){
    return src.match(rule.markdown)?.index;
  },
  match(src) {
    let raw = src.match(rule.markdown)?.[0];
    if (!raw) return;
    return{
      raw,
      text: raw,
    };
  },
  render(matched){
    return matched.text;
  }
};
const escapeHTML: MarkdownExtension = {
  name: 'escape-html',
  level: 'inline',
  priority: 0,
  start(src){
    return src.match(rule.html)?.index;
  },
  match(src) {
    let raw = src.match(rule.markdown)?.[0];
    if (!raw) return;
    return{
      raw,
      text: raw,
    };
  },
  render(matched){
    return ['&amp;lt;', '&gt;', '&amp;'][['<', '>', '&'].indexOf(matched.text)];
  }
};
module.exports = [escapeMarkdown, escapeHTML]
