export function info(scope: string, ...msgs: any[]) {
  for (const msg of msgs) {
    if (['function', 'object'].includes(typeof msg)) {
      console.info('[' + scope + '][\x1B[36minfo\x1B[0m] ', msg);
    } else {
      console.info('[' + scope + '][\x1B[36minfo\x1B[0m] ' + msg);
    }
  }
}

export function warn(scope: string, ...msgs: any[]) {
  for (const msg of msgs) {
    if (['function', 'object'].includes(typeof msg)) {
      console.info('[' + scope + '][\x1B[33mwarn\x1B[0m] ', msg);
    } else {
      console.info('[' + scope + '][\x1B[33mwarn\x1B[0m] ' + msg);
    }
  }
}