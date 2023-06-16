const hr: MarkdownExtension = {
  name: 'hr',
  level: 'block',
  priority: 0,
  start(src) {
    let a = src.match(/(^|(?<=\n))[\*\-_]{3,}\s/)?.index;
    if (typeof a === 'string') return a;
    return src.match(/(^|(?<=\n))[\*\-_]{3,}$/)?.index;
  },
  match(src) {
    let a = src.match(/(^|(?<=\n))[\*\-_]{3,}\s/)?.[0];
    let raw = a;
    if (!a) {
      raw = src.match(/(^|(?<=\n))[\*\-_]{3,}$/)?.[0];
    }
    if (!raw) return;
    return{
      raw,
      text: '',
    }
  },
  render() {
    return'<hr>';
  },
};
module.exports = hr;
