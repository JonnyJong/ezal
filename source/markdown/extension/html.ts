const html: MarkdownExtension = {
  name: 'html',
  level: 'inline',
  priority: 0,
  start(src){
    return src.match(/<(\S*?)[^>]*>.*?|<.*? \/>/)?.index;
  },
  match(src) {
    let raw = src.match(/<(\S*?)[^>]*>.*?|<.*? \/>/)?.[0];
    if (!raw) return;
    return{
      raw,
      text: raw,
    };
  },
  render(matched) {
    return matched.text;
  },
}
module.exports = html;
