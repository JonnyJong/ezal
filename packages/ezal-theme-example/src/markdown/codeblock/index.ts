import { transformerColorizedBrackets } from '@shikijs/colorized-brackets';
import {
	transformerNotationDiff,
	transformerNotationErrorLevel,
	transformerNotationFocus,
	transformerNotationHighlight,
	transformerNotationWordHighlight,
	transformerStyleToClass,
} from '@shikijs/transformers';
import { ModelOperations } from '@vscode/vscode-languagedetection';
import { getMode } from 'ezal';
import {
	type CodeblockParsed,
	type CommonPlugin,
	type PluginContext,
	plugins,
	utils,
} from 'ezal-markdown';
import {
	type BundledLanguage,
	type BundledTheme,
	createHighlighter,
	type HighlighterGeneric,
	type ShikiTransformer,
} from 'shiki';
import { getThemeConfig } from '../../config';
import { LANGUAGE_MAP } from './data';
import { updateStyles } from './style';

const PATTERN_CLASS = /class="([A-Za-z0-9 -]+)"/;
const PATTERN_EMPTY_LINE =
	/\n<span class="line">(<span class="mtk-\d+"><\/span>)?<\/span><\/code><\/pre>$/;

const modelOperations = new ModelOperations();

async function getLang(code: string, lang?: string): Promise<string> {
	if (lang) return lang;
	const result = await modelOperations.runModel(code);
	return result.toSorted((a, b) => b.confidence - a.confidence)[0].languageId;
}

let shiki: HighlighterGeneric<BundledLanguage, BundledTheme>;
const shikiClassName: string[] = [];
const toClass = transformerStyleToClass({
	classReplacer(name) {
		let i = shikiClassName.indexOf(name);
		if (i === -1) {
			i = shikiClassName.length;
			shikiClassName.push(name);
		}
		return `mtk-${i}`;
	},
});
const transformers: ShikiTransformer[] = [
	transformerNotationDiff(),
	transformerNotationHighlight(),
	transformerNotationWordHighlight(),
	transformerNotationFocus(),
	transformerNotationErrorLevel(),
	transformerColorizedBrackets(),
	toClass,
];

async function highlighter(
	code: string,
	lang?: string,
): Promise<[html: string, lang: string]> {
	lang = await getLang(code, lang);
	let loadedLanguage = lang;
	try {
		await shiki.loadLanguage(lang as any);
	} catch {
		loadedLanguage = 'plain';
	}
	const theme = getThemeConfig().markdown?.codeBlockTheme;
	const html = await shiki.codeToHtml(code, {
		lang: loadedLanguage,
		themes: {
			light: theme?.light.name ?? 'light-plus',
			dark: theme?.dark.name ?? 'dark-plus',
		},
		transformers,
	});
	if (getMode() === 'serve') updateStyles(toClass.getCSS());
	return [html, lang];
}

const { $ } = utils;

function packager(html: string, lang: string, extra: string): string {
	const name = LANGUAGE_MAP.get(lang) ?? lang;
	let mtk = '';
	html = html
		.replace(PATTERN_CLASS, (_, className: string) => {
			const classes = className.split(' ');
			const result: string[] = ['shiki'];
			for (const name of classes) {
				if (name.startsWith('has-')) result.push(name);
				else if (name.startsWith('mtk-')) mtk = name;
			}
			return `class="${result.join(' ')}"`;
		})
		.replace(PATTERN_EMPTY_LINE, '</code></pre>');
	return $('figure', {
		class: ['code', 'rounded', mtk],
		html: [
			$('figcaption', {
				class: ['sticky', 'rounded'],
				html: [
					$('code', name),
					extra,
					$('button', { class: ['link', 'icon-copy'], attr: { title: '复制代码' } }),
				],
			}),
			html,
		],
	});
}

const origin = plugins.codeblock();

async function render(
	{ code, lang, children }: CodeblockParsed,
	{ shared, counter }: PluginContext,
): Promise<string> {
	counter.count(code);
	shared.codeblock = true;
	const result = await highlighter(code, lang);
	return packager(result[0], result[1], children?.html ?? '');
}

const indented: CommonPlugin<'block', CodeblockParsed> = {
	...origin.indentedCodeblock,
	render,
};

const fenced: CommonPlugin<'block', CodeblockParsed> = {
	...origin.fencedCodeblock,
	render,
};

export async function codeblock() {
	const theme = getThemeConfig().markdown?.codeBlockTheme;
	shiki = await createHighlighter({
		themes: theme ? [theme.light, theme.dark] : ['light-plus', 'dark-plus'],
		langs: [],
	});
	return { indented, fenced };
}

export function setupCodeblockStyle() {
	updateStyles(toClass.getCSS());
}
