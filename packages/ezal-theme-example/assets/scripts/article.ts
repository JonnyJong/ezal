import {
	initCodeblock,
	initFootnote,
	initImage,
	initTabs,
	initToc,
} from './_article';
import { initBase } from './_base';
import { doc, handle } from './_utils';

handle(doc, 'DOMContentLoaded', () => {
	initBase();
	initTabs();
	initToc();
	initCodeblock();
	initFootnote();
	initImage();
});
