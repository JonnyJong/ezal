function info(...params:Array<any>) {
  params.forEach((value)=>console.info('\x1b[42mINFO\x1b[0m ' + value));
}
function error(...params:Array<any>) {
  params.forEach((value)=>console.error('\x1b[41mERROR\x1b[0m ' + value));
}
function log(...params:Array<any>) {
  params.forEach((value)=>console.log(value));
}
export{info, error, log}
