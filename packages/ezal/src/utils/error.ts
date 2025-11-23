import { inspect } from 'node:util';
import { getConfig } from '../config';
import { escapeHTML, injectAutoReload } from './html';

export function normalizeError(error: unknown): Error {
	if (error instanceof Error) return error;
	if (typeof error === 'string') return new Error(error);
	return new Error(inspect(error), { cause: error });
}

export async function error2html(error: unknown): Promise<string> {
	let title = 'Error';
	let msg = '';
	if (error instanceof Error) {
		title = `Error: ${error.name}`;
		msg = `<p>${escapeHTML(error.message)}</p>`;
	}
	const html = `
<!DOCTYPE html>
<html>
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${escapeHTML(title)}</title>
</head>
<body>
${msg}
<pre>${inspect(error)}</pre>
</body>
</html>
`;
	if (!getConfig().server?.autoReload) return html;
	return await injectAutoReload(html);
}
