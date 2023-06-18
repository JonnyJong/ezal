const emojiLib = require('../emoji.json');
const emoji: MarkdownExtension = {
  name: 'emoji',
  level: 'inline',
  priority: 0,
  start(src){
    return src.match(/:([\+\-\d_a-z]+):/)?.index;
  },
  match(src){
    let matched = src.match(/:([\+\-\d_a-z]+):/);
    if (!matched || !(matched[1] in emojiLib)) return;
    return{
      raw: matched[0],
      text: emojiLib[matched[1]],
    };
  },
  render(matched){
    return matched.text;
  },
};
module.exports = emoji;
