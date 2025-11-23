import { initSearch } from './_search';
import { $, $$, doc, handle, sleep } from './_utils';

function initNav() {
	const docE = doc.documentElement;
	const nav = $('nav')!;
	let prev = docE.scrollTop;
	function scrollHandler() {
		nav.classList.remove('nav-show');
		const top = docE.scrollTop;
		nav.classList.toggle('glass', top > 64);

		const hide = top > prev && top > 64;
		nav.classList.toggle('nav-hide', hide);

		prev = top;
	}
	handle(window, 'scroll', scrollHandler);
	scrollHandler();

	handle(doc.getElementById('nav')!, 'click', () => {
		nav.classList.add('glass');
		if (nav.classList.toggle('nav-show')) return;
		if (docE.scrollTop > 64) return;
		nav.classList.remove('glass');
	});

	handle(docE, 'click', async ({ target }) => {
		if ((target as HTMLElement).tagName !== 'A') return;
		if (!(target as HTMLElement).closest('.toc')) return;
		await sleep(10);
		nav.classList.add('nav-hide');
	});
}

function initImage() {
	const done = (img: HTMLImageElement) => img.classList.add('loaded');
	for (const img of $$<HTMLImageElement>('img')) {
		if (img.complete) done(img);
		else handle(img, 'load', () => done(img));
	}
}

const TIME_OF_DAY = 1000 * 60 * 60 * 24;

function initFooter() {
	const now = new Date();
	const diff = (date: Date) =>
		Math.floor((now.getTime() - date.getTime()) / TIME_OF_DAY);
	const nowE = $<HTMLTimeElement>('footer #now')!;
	nowE.textContent = now.getFullYear().toString();
	const lastE = $<HTMLTimeElement>('footer #last')!;
	const last = new Date(lastE.dateTime);
	lastE.textContent = `${diff(last)} 天前`;
	const sinceE = $<HTMLTimeElement>('footer #since')!;
	const since = new Date(sinceE.dateTime);
	sinceE.textContent = ` ${diff(since)} `;
}

export function initBase() {
	initNav();
	initImage();
	initFooter();
	initSearch();
}
