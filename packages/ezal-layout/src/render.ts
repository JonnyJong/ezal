import { ContainerNode, DocNode, Node, RawHTMLNode } from './runtime';

const VOID_ELEMENT = new Set([
	'area',
	'base',
	'br',
	'embed',
	'hr',
	'img',
	'input',
	'link',
	'meta',
	'source',
	'track',
	'wbr',
]);

const PATTERN_HTML_CHAR = /[&<>"']/g;
const HTML_ESCAPE_MAP: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
};
/** 转义 HTML */
function escapeHTML(text: string): string {
	return text.replace(PATTERN_HTML_CHAR, (char) => HTML_ESCAPE_MAP[char]);
}

const ILLEGAL_ATTR_NAME_CHAR = /[ "'<=>/\t\n\f\r\0]/;
const BOOL_ATTR = new Set(['autofocus', 'hidden', 'inert', 'itemscope']);
const LITERAL_ATTR = new Set(['contenteditable', 'draggable', 'spellcheck']);
const TAG_BOOL_ATTR = new Map([
	['audio', new Set(['autoplay', 'loop', 'muted'])],
	['button', new Set(['disabled'])],
	['fieldset', new Set(['disabled'])],
	['details', new Set(['open'])],
	['dialog', new Set(['open'])],
	['form', new Set(['novalidate'])],
	['img', new Set(['ismap'])],
	[
		'input',
		new Set([
			'autocomplete',
			'checked',
			'disabled',
			'multiple',
			'readonly',
			'required',
		]),
	],
	['link', new Set(['disabled'])],
	['ol', new Set(['reversed'])],
	['optgroup', new Set(['disabled'])],
	['option', new Set(['disabled', 'selected'])],
	['script', new Set(['async', 'defer', 'nomodule'])],
	['select', new Set(['autofocus', 'disabled', 'multiple', 'required'])],
	[
		'textarea',
		new Set(['autocapitalize', 'autofocus', 'disabled', 'readonly', 'required']),
	],
	[
		'video',
		new Set([
			'autoplay',
			'disablepictureinpicture',
			'disableremoteplayback',
			'loop',
			'muted',
			'playsinline',
		]),
	],
]);
const TAG_LITERAL_ATTR = new Map([
	['audio', new Set(['controls'])],
	['video', new Set(['controls'])],
]);

const ATTRIBUTE_RULES: ((
	value: any,
	name: string,
	tag: string,
) => string | null)[] = [
	(value, name) => {
		if (name !== 'class') return null;
		return `class="${escapeHTML(classList(value))}"`;
	},
	(value, name) => {
		if (name !== 'style') return null;
		return `style="${escapeHTML(style(value))}"`;
	},
	(value, name, tag) => {
		if (!TAG_BOOL_ATTR.get(tag)?.has(name)) return null;
		return value ? name : '';
	},
	(value, name, tag) => {
		if (!TAG_LITERAL_ATTR.get(tag)?.has(name)) return null;
		return value ? name : '';
	},
	(value, name) => {
		if (!BOOL_ATTR.has(name)) return null;
		return value ? name : '';
	},
	(value, name) => (LITERAL_ATTR.has(name) ? String(value) : null),
	(value, name) => {
		if (value === true) return name;
		if (value === false) return '';
		if (value instanceof URL) value = value.href;
		return `${name}="${escapeHTML(String(value))}"`;
	},
];

function classList(value: any): string {
	if (Array.isArray(value)) return value.map(String).join(' ');
	if (typeof value === 'string') return value;
	if (!value || typeof value !== 'object') return '';
	return Object.entries(value)
		.filter(([_, v]) => v)
		.map(String)
		.join(' ');
}

const PATTERN_CSS_VAR_DECLARE = /^\$/;
const PATTERN_CSS_UPPER = /[A-Z]/g;
const PATTERN_CSS_VAR = /\$[A-Za-z][A-Za-z0-9]*/g;

function style(value: any): string {
	if (typeof value === 'string') return value;
	return Object.entries(value)
		.filter(([_, v]) => v !== null && v !== undefined)
		.map<[string, string]>(([name, value]) => {
			if (typeof value === 'number') return [name, `${value}px`];
			if (typeof value !== 'string') return [name, String(value)];
			value = value.replace(
				PATTERN_CSS_VAR,
				(v) =>
					`var(${v
						.replace(PATTERN_CSS_VAR_DECLARE, '--')
						.replaceAll(PATTERN_CSS_UPPER, (char) => `-${char.toLowerCase()}`)})`,
			);
			return [name, value as string];
		})
		.map<[string, string]>(([name, value]) => {
			name = name
				.replace(PATTERN_CSS_VAR_DECLARE, '--')
				.replaceAll(PATTERN_CSS_UPPER, (char) => `-${char.toLowerCase()}`);
			return [name, value];
		})
		.map(([name, value]) => `${name}:${value};`)
		.join('');
}

function attr(node: Node): string {
	const result: string[] = [];
	for (const [name, value] of Object.entries(node.attr)) {
		if (ILLEGAL_ATTR_NAME_CHAR.test(name)) {
			throw new Error('Using illegal char in attribute name', { cause: node });
		}
		if (value === null || value === undefined) continue;
		for (const r of ATTRIBUTE_RULES) {
			const v = r(value, name, node.name);
			if (v === null) continue;
			result.push(v);
			break;
		}
	}
	return result.join('');
}

function head(node: Node): string {
	if (node instanceof ContainerNode) return '';
	let result = '';
	if (node instanceof DocNode) result += '<!DOCTYPE html><html';
	else result += `<${node.name}`;
	const attrText = attr(node);
	if (attrText) result += ` ${attrText}`;
	result += '>';
	return result;
}

function tail(node: Node): string {
	if (node instanceof ContainerNode) return '';
	if (node instanceof DocNode) return '</html>';
	return `</${node.name}>`;
}

export function render(input: any): string {
	if (Array.isArray(input)) {
		return input
			.flat(Infinity)
			.filter((v) => v !== null && v !== undefined)
			.map(render)
			.join('');
	}
	if (input === null) return '';
	if (input === undefined) return '';
	if (!(input instanceof Node)) return String(input);
	if (input instanceof RawHTMLNode) return input.html;
	const result: string[] = [];
	const stack: [Node, Generator<string | Node>][] = [[input, input.entires()]];
	result.push(head(input));
	ENTER: while (true) {
		const current = stack.at(-1);
		if (!current) break;
		const [node, generator] = current;
		if (VOID_ELEMENT.has(node.name)) {
			stack.pop();
			continue;
		}
		while (true) {
			const next = generator.next();
			if (next.done) break;
			const child = next.value;
			if (typeof child === 'string') {
				result.push(escapeHTML(child));
				continue;
			}
			if (child instanceof RawHTMLNode) {
				result.push(child.html);
				continue;
			}
			result.push(head(child));
			if (VOID_ELEMENT.has(child.name)) continue;
			if (child.childrenCount === 0) {
				result.push(tail(child));
				continue;
			}
			stack.push([child, child.entires()]);
			continue ENTER;
		}
		stack.pop();
		result.push(tail(node));
	}
	return result.join('');
}
