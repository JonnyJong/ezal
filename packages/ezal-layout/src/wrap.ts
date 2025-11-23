import type { LayoutRenderer } from '.';
import { render } from './render';
import { Container, Doc, h, RawHTML } from './runtime';

export default function wrap(
	content: string,
	external?: Record<string, any>,
): LayoutRenderer {
	const template = Function(
		'context',
		'require',
		'module',
		'h',
		'Doc',
		'RawHTML',
		'Container',
		content,
	);
	const require = (name: string) => external?.[name];
	return async (context) => {
		const module: { exports: Record<string, any> } = { exports: {} };
		await template(context, require, module, h, Doc, RawHTML, Container);
		let result = module.exports.default;
		if (typeof result === 'function') result = await result();
		return render(result);
	};
}
