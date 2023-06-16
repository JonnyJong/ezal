export function HTMLEncode(string: string){
  if (typeof string !== 'string') throw new TypeError(`'${string}' is not a string.`);
  return string.replace(/<|>|&/g, (str)=>{
    return ['&amp;lt;', '&gt;', '&amp;'][['<', '>', '&'].indexOf(str)];
  })
}
