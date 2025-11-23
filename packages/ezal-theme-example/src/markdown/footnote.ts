import {
	type ASTPlugin,
	type CommonPlugin,
	LinkNode,
	type Parsed,
	type ParsedChild,
	ParsedNode,
	type RendererPlugin,
	utils,
} from 'ezal-markdown';

interface LinkParsed extends Parsed {
	id: string;
	label: string;
}

interface SourceParsed extends Parsed {
	children: ParsedChild[];
	id: [label: string, id: string][];
}

const { eachLine, $ } = utils;

const PATTERN_SOURCE_START = /(?<=^|\n)\[\^.*?\]:/;
const PATTERN_SOURCE_BEGIN = /^\[(.*?)\]:/;
const PATTERN_SOURCE_INDENT = /^(\t| {1,4})/;

const render: RendererPlugin<'inline', LinkParsed> = {
	name: 'footnote',
	type: 'inline',
	render({ id, label }, { counter }) {
		counter.count(label);
		return $(
			'sup',
			$('a', {
				class: 'footnote',
				attr: { href: id },
				content: label,
			}),
		);
	},
};

const ast: ASTPlugin<'inline', LinkNode> = {
	name: 'footnote-ast',
	type: 'inline',
	phase: 'post',
	priority: -1,
	parse(root) {
		for (const child of root.entires().toArray()) {
			if (!(child instanceof LinkNode)) continue;
			if (child.label?.[0] !== '^') continue;
			if (child.raw?.length !== child.label.length + 2) continue;
			const id = child.destination;
			const label = child.raw.slice(2, -1);
			child.before(
				new ParsedNode('footnote', 'inline', { id, label } as LinkParsed),
			);
			child.remove();
		}
	},
	verifyNode: (_): _ is LinkNode => false,
	render: () => '',
};

const source: CommonPlugin<'block', SourceParsed> = {
	name: 'footnote-source',
	type: 'block',
	order: 0,
	priority: 0,
	start: PATTERN_SOURCE_START,
	parse(source, { anchors, refMap, md }) {
		const contents: string[] = [];
		const id: [string, string][] = [];
		let current = '';
		let raw = '';
		let indentState: boolean | null = null;
		for (const [line] of eachLine(source)) {
			const matched = line.match(PATTERN_SOURCE_BEGIN);
			// 首行
			if (matched) {
				if (matched[1][0] !== '^') break;
				if (raw) contents.push(current);
				const label = matched[1].slice(1);
				const hash = anchors.register(label);
				id.push([label, hash]);
				refMap.set(matched[1], { destination: `#${hash}` });
				current = line.slice(matched[0].length);
				raw += line;
				indentState = null;
				continue;
			}
			// 懒续行
			const indent = PATTERN_SOURCE_INDENT.test(line);
			const empty = line.trim().length === 0;
			// 第二行设置缩进状态：若第二行为空则后续必须缩进
			if (indentState === null) indentState = indent || empty;
			// 若无需缩进或之前存在无缩进行，且当前行为空行则结束
			if (!indentState && empty) break;
			// 若需要缩进而为缩进则结束
			if (indentState && !indent) break;
			// 若不为空行且未缩进则设置为无缩进
			if (!(empty || indent)) indentState = false;
			current += line;
			raw += line;
		}
		if (id.length !== contents.length) contents.push(current);
		const children = contents.map((content) =>
			md(content, { skipParagraphWrapping: true, maxLevel: 'block' }),
		);
		return { raw, id, children };
	},
	render({ id, children }, { counter }) {
		for (const [label] of id) {
			counter.count(label);
		}
		for (const child of children) {
			counter.count(child.raw);
		}
		return $(
			'dl',
			children.flatMap((child, i) => [
				$('dt', { content: id[i][0], id: id[i][1] }),
				$('dd', child.html),
			]),
		);
	},
};

export const footnote = { source, ast, render };
