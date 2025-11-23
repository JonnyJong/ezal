import type { CommonPlugin, Parsed, PluginLogger } from 'ezal-markdown';
import katex, { type StrictFunction } from 'katex';

const PATTERN_INLINE = /(?<=\s|\W|^)(?<!\$)(\$\$?)(.+?)(\1)(?!\$)(?=\s|\W|$)/;
const PATTERN_BLOCK = /(?<=^|\n) {0,3}\$\$.*?\$\$\s*(\n|$)/s;

const katexErrorHandler =
	(logger: PluginLogger): StrictFunction =>
	(errorCode, errorMsg, token) => {
		switch (errorCode) {
			case 'unknownSymbol':
			case 'unicodeTextInMathMode':
			case 'mathVsTextUnits':
			case 'newLineInDisplayMode':
			case 'htmlExtension':
				logger.warn(`${errorCode}: ${errorMsg}`, token);
				break;
			case 'commentAtEnd':
				logger.error(`${errorCode}: ${errorMsg}`, token);
				break;
		}
		return false;
	};

interface TexParsed extends Parsed {
	tex: string;
}

const inline: CommonPlugin<'inline', TexParsed> = {
	name: 'tex',
	type: 'inline',
	order: 0,
	priority: 0,
	start: PATTERN_INLINE,
	parse(source) {
		const matched = source.match(PATTERN_INLINE);
		if (!matched) return;
		const raw = matched[0];
		const tex = matched[2];
		return { raw, tex };
	},
	render({ tex }, { logger, shared, counter }) {
		shared.tex = true;
		counter.count(tex);
		return katex.renderToString(tex, {
			output: 'html',
			throwOnError: false,
			strict: katexErrorHandler(logger),
		});
	},
};

const block: CommonPlugin<'block', TexParsed> = {
	name: 'tex',
	type: 'block',
	order: 0,
	priority: 0,
	start: PATTERN_BLOCK,
	parse(source) {
		const matched = source.match(PATTERN_BLOCK);
		if (!matched) return;
		const raw = matched[0];
		const start = raw.indexOf('$$');
		const end = raw.lastIndexOf('$$');
		const tex = raw.slice(start + 2, end).trim();
		return { raw, tex };
	},
	render({ tex }, { logger, shared, counter }) {
		shared.tex = true;
		counter.count(tex);
		return katex.renderToString(tex, {
			displayMode: true,
			output: 'html',
			throwOnError: false,
			strict: katexErrorHandler(logger),
		});
	},
};

export const tex = { inline, block };
