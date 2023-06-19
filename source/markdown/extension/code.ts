type MarkdownExtension = import('../../markdown').MarkdownExtension;
const code: MarkdownExtension = {
  name: 'code',
  level: 'inline',
  priority: 0,
  start(src){
    return src.match(/`[^`](.*?)`/)?.index;
  },
  match(src) {
    let raw = src.match(/`[^`](.*?)`/)?.[0];
    if (!raw) return;
    let text = raw.slice(1, raw.length - 1);
    return{
      raw,
      text,
    };
  },
  render(matched) {
    return `<code>${matched.text}</code>`
  },
};
const doubleCode: MarkdownExtension = {
  name: 'code-double',
  level: 'inline',
  priority: 1,
  start(src){
    return src.match(/``[^`](.*?)``/)?.index;
  },
  match(src) {
    let raw = src.match(/``[^`](.*?)``/)?.[0];
    if (!raw) return;
    let text = raw.slice(2, raw.length - 2);
    return{
      raw,
      text,
    };
  },
  render(matched) {
    return `<code>${matched.text}</code>`
  },
}
module.exports = [code, doubleCode];
