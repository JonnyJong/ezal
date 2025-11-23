import { initBase } from './_base';
import { $, $$, doc, handle } from './_utils';

let dx = 0;
let dy = 0;
let tx = 0;
let ty = 0;
let logo: HTMLElement;
let prev = 0;
let tick = 0;

const nodes = () => $$('use', logo.parentNode!);

const USE = () => {
	const node = doc.createElementNS('http://www.w3.org/2000/svg', 'use');
	node.setAttribute('href', '#logo');
	(node as any).c = tick;
	return node;
};

function next() {
	const node = USE();
	logo.after(node);
	const animation = node.animate(
		[{}, { translate: '128px 128px', opacity: '0' }],
		{ duration: 5000 },
	);
	(node as any).a = animation;
	animation.play();
	animation.onfinish = () => node.remove();
}

function animate() {
	if (dx < tx) dx = Math.min(dx + 0.1, tx);
	else if (dx > tx) dx = Math.max(dx - 0.1, tx);
	if (dy < ty) dy = Math.min(dy + 0.1, ty);
	else if (dy > ty) dy = Math.max(dy - 0.1, ty);
	if (tick - prev > 100) {
		next();
		prev = tick;
	}
	for (const node of nodes()) {
		const diff = tick - (node as any).c;
		node.setAttribute('x', String((dx * diff) / 20));
		node.setAttribute('y', String((dy * diff) / 20));
	}
	tick++;
	requestAnimationFrame(animate);
}

handle(doc, 'DOMContentLoaded', () => {
	initBase();

	logo = $('#logo')!;
	if (!logo) return;
	handle(window, 'blur', () => {
		for (const node of nodes()) {
			(node as any).a.pause();
		}
	});
	handle(window, 'focus', () => {
		for (const node of nodes()) {
			(node as any).a.play();
		}
	});
	handle(doc, 'mousemove', ({ x, y }: MouseEvent) => {
		const rw = innerWidth / 2;
		const rh = innerHeight / 2;
		tx = (rw - x) / rw;
		ty = (rh - y) / rh;
	});
	requestAnimationFrame(animate);
});
