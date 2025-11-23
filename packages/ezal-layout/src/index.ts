import { build } from './build';
import wrap from './wrap';

export type LayoutContext = Record<string | number | symbol, any>;
export type LayoutRenderer = (context: LayoutContext) => Promise<string>;
export interface EzalLayoutRenderer {
	renderer: LayoutRenderer;
	dependencies: string[];
}

export async function compile(
	src: string,
	external?: Record<string, any>,
): Promise<EzalLayoutRenderer> {
	const { content, dependencies } = await build(src, external);
	return { renderer: await wrap(content, external), dependencies };
}
