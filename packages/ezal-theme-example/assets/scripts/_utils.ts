export const doc = document;

export function $<T extends Element>(
	selector: string,
	scope: ParentNode = doc,
): T | null {
	return scope.querySelector<T>(selector);
}

export function $$<T extends Element>(
	selector: string,
	scope: ParentNode = doc,
): NodeListOf<T> {
	return scope.querySelectorAll<T>(selector);
}

export function $new<
	K extends keyof HTMLElementTagNameMap | (string & {}) =
		| keyof HTMLElementTagNameMap
		| (string & {}),
	E extends HTMLElement = K extends keyof HTMLElementTagNameMap
		? HTMLElementTagNameMap[K]
		: HTMLElement,
>(tag: K): E {
	return doc.createElement(tag) as E;
}

export const sleep = (time = 0) =>
	new Promise((resolve) => setTimeout(resolve, time));

export function handle<
	T extends EventTarget,
	K extends keyof HTMLElementEventMap | (string & {}),
	E extends Event = K extends keyof HTMLElementEventMap
		? HTMLElementEventMap[K]
		: Event,
>(
	target: T,
	event: keyof HTMLElementEventMap | (string & {}),
	handler: (this: T, event: E) => any,
) {
	target.addEventListener(event, handler as any);
}

export function offHandle<
	T extends EventTarget,
	K extends keyof HTMLElementEventMap | (string & {}),
	E extends Event = K extends keyof HTMLElementEventMap
		? HTMLElementEventMap[K]
		: Event,
>(
	target: T,
	event: keyof HTMLElementEventMap | (string & {}),
	handler: (this: T, event: E) => any,
) {
	target.removeEventListener(event, handler as any);
}

export function shuffle<T>(array: T[]): T[] {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.trunc(Math.random() * (i + 1));
		if (i === j) continue;
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

export function debounce(fn: Function, delay: number) {
	let timeoutId: number;
	return (...args: any[]) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => fn.apply(null, args), delay);
	};
}
