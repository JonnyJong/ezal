import { type CommonPlugin, type Parsed, utils } from 'ezal-markdown';

interface KbdParsed extends Parsed {
	key: string;
}

const PATTERN = /{{\S+?}}/;

const { $ } = utils;

export const kbd: CommonPlugin<'inline', KbdParsed> = {
	name: 'kbd',
	type: 'inline',
	order: 0,
	priority: 0,
	start: PATTERN,
	parse(source) {
		const matched = source.match(PATTERN);
		if (!matched) return;
		return { raw: matched[0], key: matched[0].slice(2, -2) };
	},
	render({ key }, { counter }) {
		counter.count(key);
		return $('kbd', { content: key });
	},
};
