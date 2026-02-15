import { inspect } from 'node:util';
import { build } from './build';
import wrap from './wrap';

export type LayoutContext = Record<string | number | symbol, any>;
export type LayoutRenderer = (
	context: LayoutContext,
) => Promise<string | Error>;
export interface EzalLayoutRenderer {
	renderer: LayoutRenderer;
	dependencies: string[];
}

function normalizeError(error: unknown): Error {
	if (error instanceof Error) return error;
	if (typeof error === 'string') return new Error(error);
	return new Error(inspect(error), { cause: error });
}

function safeCall<A extends any[], R>(
	fn: (...args: A) => Promise<R>,
): (...args: A) => Promise<R | Error> {
	return async (...args) => {
		try {
			return await fn(...args);
		} catch (error) {
			return normalizeError(error);
		}
	};
}

export async function compile(
	src: string,
	external?: Record<string, any>,
): Promise<EzalLayoutRenderer> {
	const { content, dependencies } = await build(src, external);
	const renderer = wrap(content, external);
	return { renderer: safeCall(renderer), dependencies };
}

export interface LayoutCompilerInit {
	context?: (ctx: LayoutContext) => LayoutContext;
	external?: Record<string, any>;
}

export function createCompiler(
	init?: LayoutCompilerInit,
): (src: string) => Promise<EzalLayoutRenderer | Error> {
	const { context, external } = init ?? {};
	const compile = async (src: string): Promise<EzalLayoutRenderer | Error> => {
		const { content, dependencies } = await build(src, external);
		const renderer = wrap(content, external);
		return {
			renderer: (ctx) => renderer(context ? context(ctx) : ctx),
			dependencies,
		};
	};
	return safeCall(compile);
}
