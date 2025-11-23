import { initCodeblock, initFootnote, initImage, initTabs } from './_article';
import { initBase } from './_base';
import { doc, handle } from './_utils';

handle(doc, 'DOMContentLoaded', () => {
	initBase();
	initTabs();
	initCodeblock();
	initFootnote();
	initImage();
});
