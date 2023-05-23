type EventType = 'init' | 'init-pages' | 'pre-render' | 'post-render' | 'pre-generate' | 'post-generate' | 'pre-style' | 'post-style' | 'pre-assets' | 'post-assets'

interface Events{
  'init': Function[],
  'init-pages': Function[],
  'pre-render': Function[],
  'post-render': Function[],
  'pre-generate': Function[],
  'post-generate': Function[],
  'pre-style': Function[],
  'post-style': Function[],
  'pre-assets': Function[],
  'post-assets': Function[],
};

let events: Events = {
  'init': [],
  "init-pages": [],
  "pre-render": [],
  "post-render": [],
  "pre-generate": [],
  "post-generate": [],
  "pre-style": [],
  "post-style": [],
  "pre-assets": [],
  "post-assets": [],
};

function addListener(type: EventType, listener: Function) {
  if (!(type in events)) return;
  events[type].push(listener);
}
async function dispatchEvent(type: EventType, ...args: any){
  if (!(type in events)) return;
  for (const listener of events[type]) {
    await listener(...args);
  }
}

export {
  addListener,
  dispatchEvent,
};
