function info(...params:Array<any>) {
  params.forEach((value)=>console.info('\x1b[42mINFO\x1b[0m ' + value));
}
function error(...params:Array<any>) {
  params.forEach((value)=>console.error('\x1b[41mERROR\x1b[0m ' + value));
}
function log(...params:Array<any>) {
  params.forEach((value)=>console.log(value));
}
function warn(...params:Array<any>) {
  params.forEach((value)=>console.warn('\x1b[43mWARN\x1b[0m ' + value));
}
export{info, error, log, warn}
