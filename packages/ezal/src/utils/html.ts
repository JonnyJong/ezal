import path from 'node:path';
import fs from './fs';

const PATTERN_HTML_CHAR = /[&<>"']/g;
const HTML_ESCAPE_MAP: Record<string, string> = {
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
	"'": '&#39;',
};
/** 转义 HTML */
export function escapeHTML(text: string): string {
	return text.replace(PATTERN_HTML_CHAR, (char) => HTML_ESCAPE_MAP[char]);
}

const INJECT_LOCATIONS = ['</head>', '</body>', '</html>'];
let autoReloadScript: string | undefined;

function findInjectPosition(html: string): number {
	for (const str of INJECT_LOCATIONS) {
		const i = html.indexOf(str);
		if (i !== -1) return i;
	}
	return html.length;
}

/** 注入自动重载 JS */
export async function injectAutoReload(html: string) {
	if (!autoReloadScript) {
		const script = await fs.readFile(path.join(__dirname, '../auto-reload.js'));
		if (script instanceof Error) throw script;
		autoReloadScript = `<script>${script}</script>`;
	}
	const pos = findInjectPosition(html);
	return html.slice(0, pos) + autoReloadScript + html.slice(pos);
}
