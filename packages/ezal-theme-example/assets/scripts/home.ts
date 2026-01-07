import { initBase } from './_base';
import { $, doc, handle } from './_utils';

let logo: HTMLElement;
let nodes: SVGUseElement[];

const USE = () => {
	const node = doc.createElementNS('http://www.w3.org/2000/svg', 'use');
	node.setAttribute('href', '#logo');
	return node;
};

handle(doc, 'DOMContentLoaded', () => {
	initBase();

	logo = $('#logo')!;
	if (!logo) return;
	nodes = new Array(9).fill(0).map(USE);
	logo.after(...nodes);

	handle(doc, 'mousemove', ({ x, y }: MouseEvent) => {
		const rw = innerWidth / 2;
		const rh = innerHeight / 2;
		const tx = (rw - x) / rw;
		const ty = (rh - y) / rh;
		for (let [i, node] of nodes.entries()) {
			i++;
			node.style.translate = `${tx * i * 4}px ${ty * i * 4}px`;
		}
	});
});
