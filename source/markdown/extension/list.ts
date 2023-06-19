import { config } from "ezal";
import { markdown } from '../../markdown';

type MarkdownExtension = import('../../markdown').MarkdownExtension;
const ol: MarkdownExtension = {
  name: 'ol',
  level: 'block',
  priority: 0,
  start(src){
    return src.match(/(^|(?<=\n))1\. (.*)/)?.index;
  },
  match(src){
    let lines = src.split('\n');
    let end = 1;
    for (const line of lines) {
      if (!line.match(/(\d\. |  |\t)/)) break;
      end++;
    }
    let rawLines = lines.slice(0, end);
    let raw = rawLines.join('\n');
    let text = '';
    let args: string[] = [];
    let i = -1;
    for (const line of rawLines) {
      text += line.slice(2).trim();
    }
    for (const line of rawLines) {
      if (line.match(/\d\. /)?.index === 0) {
        i++;
        args.push(line.slice(2).trim() + '\n');
        text += line.slice(2).trim() + '\n';
        continue;
      }
      text += line.trim() + '\n';
      args[i] += line.trim() + '\n';
    }
    return{
      raw,
      text,
      args,
    };
  },
  async render(matched, v){
    let html = '';
    for (const arg of (matched.args as unknown as string[])) {
      html += `<li>${(await markdown(arg, v, false)).context}</li>`;
      // TODO: may need replace <p></p>
      // html += `<li>${rendered.slice(3, rendered.length - 4)}</li>`;
    }
    return `<ol>${html}</ol>`;
  }
};
const ul: MarkdownExtension = {
  name: 'ul',
  level: 'block',
  priority: 0,
  start(src){
    return src.match(/(^|(?<=\n))[\-\*\+]{1} (.*)/)?.index;
  },
  match(src){
    let lines = src.split('\n');
    let end = 1;
    for (let i = 0; i < lines.length; i++) {
      if (!lines[i].match(/(\-|\*|\+|  |\t)/)) break;
      end++;
    }
    let rawLines = lines.slice(0, end);
    let raw = rawLines.join('\n');
    let text = '';
    let args: string[] = [];
    let i = -1;
    for (const line of rawLines) {
      text += line.slice(2).trim();
    }
    for (const line of rawLines) {
      if (line.match(/\-|\*|\+/)?.index === 0) {
        i++;
        args.push(line.slice(2).trim() + '\n');
        text += line.slice(2).trim() + '\n';
        continue;
      }
      text += line.trim() + '\n';
      args[i] += line.trim() + '\n';
    }
    return{
      raw,
      text,
      args,
    };
  },
  async render(matched, v){
    let html = '';
    for (const arg of (matched.args as unknown as string[])) {
      let matched = arg.match(/^\[(\S|\s)\] (.*)/);
      if (matched) {
        html += `<li${config.markdown.task_list_classname ? ` class="${config.markdown.task_list_classname}"` : ''}><input type="checkbox"${matched[1] !== ' ' ? ' checked' : ''} disabled>${(await markdown(matched[2], v, false)).context}</li>`;
        continue;
      }
      html += `<li>${(await markdown(arg, v, false)).context}</li>`;
    }
    return `<ul>${html}</ul>`;
  }
};
module.exports = [ol, ul];
