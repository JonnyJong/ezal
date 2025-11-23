import {
	type CommonPlugin,
	type Parsed,
	type ParsedChild,
	utils,
} from 'ezal-markdown';

interface NoteParsed extends Parsed {
	type: string;
	title: string;
	children: ParsedChild;
}

const PATTERN_START = /(?<=^|\n) {0,3}(!{3,}) ?(info|tip|warn|danger)(.*)\n/;

const { $ } = utils;

const NOTE_TITLE: Record<string, string> = {
	info: '注意',
	tip: '提示',
	warn: '警告',
	danger: '危险',
};

export const note: CommonPlugin<'block', NoteParsed> = {
	name: 'note',
	type: 'block',
	order: 0,
	priority: 0,
	start: PATTERN_START,
	parse(source, { md }) {
		const matched = source.match(PATTERN_START);
		if (!matched) return;
		const size = matched[1].length;
		const type = matched[2];
		let title = matched[3]?.trim();
		if (!title) title = NOTE_TITLE[type];
		const pattern = new RegExp(`(?<=^|\\n) {0,3}!{${size}}\\s*(\\n|$)`);
		const endMatched = source.match(pattern);
		const end = endMatched?.index ?? Infinity;
		const rawEnd = end + (endMatched?.[0].length ?? 0);
		const raw = source.slice(0, rawEnd);
		const content = raw.slice(matched[0].length, end);
		return { raw, type, title, children: md(content, 'block') };
	},
	render({ type, title, children }) {
		return $('div', {
			class: ['note', `note-${type}`],
			html: [$('p', [$('i', { class: `icon-${type}` }), title]), children.html],
		});
	},
};
