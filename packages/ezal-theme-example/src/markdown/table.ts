import { plugins, utils } from 'ezal-markdown';

const { $ } = utils;

const origin = plugins.table();

export const table: typeof origin = {
	...origin,
	render(source, context, options) {
		return $('div', {
			class: ['table', 'rounded'],
			attr: { tabindex: '0' },
			html: origin.render(source, context, options) as string,
		});
	},
};
