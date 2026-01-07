import {
	initCodeblock,
	initFootnote,
	initImage,
	initTabs,
	initToc,
} from './_article';
import { initBase } from './_base';
import { $, doc, handle } from './_utils';

function initOutdate() {
	const outdate = $<HTMLElement>('.article-outdate');
	if (!outdate) return;
	if (!outdate.dataset.time) return;
	const time = new Date(outdate.dataset.time).getTime();
	if (Date.now() < time) return;
	outdate.classList.add('article-outdate-show');
}

handle(doc, 'DOMContentLoaded', () => {
	initBase();
	initTabs();
	initToc();
	initCodeblock();
	initFootnote();
	initImage();
	initOutdate();
});
