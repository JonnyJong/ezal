const image: MarkdownExtension = {
  name: 'image',
  level: 'inline',
  priority: 0,
  start(src){
    return src.match(/!\[(.*)\]\((.*)\)/)?.index;
  },
  match(src) {
    let matched = src.match(/!\[(.*)\]\((.*)\)/);
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
    return`<img src="${matched.link}" alt="${matched.text}"${matched.title ? ' title="' + matched.title + '"' : ''}>`
  }
}
module.exports = image;
