import { type CommonPlugin, type Parsed, utils } from 'ezal-markdown';

interface MermaidParsed extends Parsed {
	content: string;
}

const PATTERN_START = /(?<=^|\n)( {0,3})(`{3,}|~{3,})\s*mermaid\s*(?=$|\n)/i;

const { $ } = utils;

export const mermaid: CommonPlugin<'block', MermaidParsed> = {
	name: 'mermaid',
	type: 'block',
	order: 0,
	priority: 1,
	start: PATTERN_START,
	parse(source) {
		const start = source.match(PATTERN_START);
		if (!start) return;
		const fenceLength = start[2].length;
		const fenceType = start[2][0];
		const startOffset = start[0].length;
		const end = source
			.slice(startOffset)
			.match(
				new RegExp(`(?<=\n)( {0,3})${fenceType}{${fenceLength},}[ \t]*(\n|$)`),
			);
		const raw = source.slice(
			0,
			end?.index ? startOffset + end.index + end[0].length : undefined,
		);
		const content = raw.slice(
			startOffset + 1,
			end?.index ? startOffset + end.index : undefined,
		);
		return { raw, content };
	},
	render({ content }, { shared, counter }) {
		counter.count(content);
		shared.mermaid = true;
		return $('pre', { class: 'mermaid', content });
	},
};
