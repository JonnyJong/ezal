import path from "path/posix";
import fs from "fs/promises";

let config: any = {};

export function HTMLEncode(string: string){
  if (typeof string !== 'string') throw new TypeError(`'${string}' is not a string.`);
  return string.replace(/<|>|&/g, (str)=>{
    return ['&amp;lt;', '&gt;', '&amp;'][['<', '>', '&'].indexOf(str)];
  })
}

const testUrl = /^(#|\/\/|http(s)?:)/;
export function url_for(url: string){
  url = String(url).replace(/\\/g, '/');
  if (testUrl.test(url)) return url;
  return path.join(config.root, encodeURI(url));
}
export function full_url_for(url: string){
  url = String(url).replace(/\\/g, '/');
  if (testUrl.test(url)) return url;
  return 'https://' + config.host + '/' + path.join(config.root, encodeURI(url));
}

export function now(){
  return new Date(Date.now());
}

let dateTemplate = {
  D: ['Sun.','Mon.','Tue.','Wed.','Thur.','Fri.','Sat.'],
  DD: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'],
  MMM: ['Jan.','Feb.','Mar.','Apr.','May.','Jun.','Jul.','Aug.','Sep.','Oct.','Nov.','Dec.'],
  MMMM: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  AP: ['AM','PM'],
  ap: ['am','pm'],
};
export function parseDate(date: any, format: string, option: any = dateTemplate) {
  const timeOffset = config.timezone * 3600000;
  if (typeof format !== 'string') {
    format = option.ISO;
  }
  switch (typeof date) {
    case 'number':
    case 'string':
      date = new Date(date);
      break;
    case 'object':
      if (date instanceof Date) break;
    default:
      date = new Date();
      break;
  }
  date = new Date(date.getTime() - timeOffset);
  format = format.replace(/yyyy/g, date.getUTCFullYear());
  format = format.replace(/yy/g, String(date.getUTCFullYear()).substring(2));
  format = format.replace(/MMMM/g, option.MMMM[date.getUTCMonth()]);
  format = format.replace(/MMM/g, option.MMM[date.getUTCMonth()]);
  format = format.replace(/MM/g, String(date.getUTCMonth()).padStart(2, '0'));
  format = format.replace(/M/g, date.getUTCMonth());
  format = format.replace(/DD/g, option.DD[date.getUTCDay()]);
  format = format.replace(/D/g, option.D[date.getUTCDay()]);
  format = format.replace(/dd/g, String(date.getUTCDate()).padStart(2, '0'));
  format = format.replace(/d/g, date.getUTCDate());
  format = format.replace(/AP/g, option.AP[parseInt((date.getUTCHours() / 12) as unknown as string)]);
  format = format.replace(/ap/g, option.ap[parseInt((date.getUTCHours() / 12) as unknown as string)]);
  format = format.replace(/HH/g, String(date.getUTCHours()).padStart(2, '0'));
  format = format.replace(/H/g, date.getUTCHours());
  let h = date.getUTCHours();
  if (h > 12) {
    h -= 12;
  }
  format = format.replace(/hh/g, String(h).padStart(2, '0'));
  format = format.replace(/h/g, h);
  format = format.replace(/mm/, String(date.getUTCMinutes()).padStart(2, '0'));
  format = format.replace(/m/, date.getUTCMinutes());
  format = format.replace(/ss/, String(date.getUTCSeconds()).padStart(2, '0'));
  format = format.replace(/s/, date.getUTCSeconds());
  format = format.replace(/zzz/, String(date.getUTCMilliseconds()).padStart(3, '0'));
  format = format.replace(/z/, date.getUTCMilliseconds());
  return format;
}
export function setDateTemplate(option: any){
  dateTemplate = option;
}
export async function writeFile(url: string, data: any, option?: BufferEncoding){
  let dir = path.join(url, '../');
  if (process.platform === 'win32') {
    dir = path.join(url, '..\\');
  }
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
  return await fs.writeFile(url, data, option);
}
module.exports = function initUtil(cfg: any){
  config = cfg;
  return {
    HTMLEncode,
    url_for,
    full_url_for,
    now,
    parseDate,
    setDateTemplate,
    writeFile,
  };
}
