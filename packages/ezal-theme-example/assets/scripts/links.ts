import { initCodeblock, initFootnote, initImage, initTabs } from './_article';
import { initBase } from './_base';
import { $$, doc, handle, shuffle } from './_utils';

handle(doc, 'DOMContentLoaded', () => {
	initBase();
	initTabs();
	initCodeblock();
	initFootnote();
	initImage();
	for (const element of $$<HTMLElement>('article .links')) {
		element.replaceChildren(...shuffle([...element.children]));
	}
});
