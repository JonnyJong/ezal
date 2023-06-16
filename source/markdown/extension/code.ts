type MarkdownExtension = import('../../markdown').MarkdownExtension;
const code: MarkdownExtension = {
  name: 'code',
  level: 'inline',
  priority: 0,
  start(src){
    return src.match(/`{1,2}[^`](.*?)`{1,2}/)?.index;
  },
  match(src) {
    let raw = src.match(/`{1,2}[^`](.*?)`{1,2}/)?.[0];
    if (!raw) return;
    let double = raw.indexOf('``') === 0;
    if (double && raw.lastIndexOf('``') !== raw.length - 2) return;
    let text = raw.slice(1, raw.length - 1);
    if (double) {
      text = text.slice(1, text.length -1);
    }
    return{
      raw,
      text,
    };
  },
  render(matched) {
    return `<pre><code>${matched.text}</code></pre>`
  },
};
module.exports = code;
