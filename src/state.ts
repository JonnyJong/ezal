export type State = 'init' | 'ready';
let currentState: State = 'init';

export function state(): State {
  return currentState;
}

export function setState(state: State) {
  currentState = state;
}