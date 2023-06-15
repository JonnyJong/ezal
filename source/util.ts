export function HTMLEncode(string: string){
  if (typeof string !== 'string') throw new TypeError(`'${string}' is not a string.`);
  return string.replace(/<|>|&/g, (str)=>{
    switch (str) {
      case '<':
        return '&amp;lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      default:
        return str;
    }
  })
}
