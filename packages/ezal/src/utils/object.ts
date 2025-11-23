import type { ArrayOr, PromiseOr } from '../types';

export function asArray<T>(input: ArrayOr<T>): T[] {
	if (Array.isArray(input)) return input;
	return [input];
}

export function compareByAscii(a: any, b: any): number {
	a = String(a);
	b = String(b);
	if (a > b) return 1;
	if (a < b) return -1;
	return 0;
}

export type PropsResolveMap<T extends Record<string, any>> = {
	[K in keyof T]: [
		keys: ArrayOr<string>,
		resolve: (input: unknown) => PromiseOr<T[K]>,
		defaultValue: () => PromiseOr<T[K]>,
	];
};

export async function resolveProps<T extends Record<string, any>>(
	input: unknown,
	map: PropsResolveMap<T>,
): Promise<T> {
	const result: Record<string, any> = {};
	if (!input || typeof input !== 'object') {
		for (const [key, [_, __, defaultValue]] of Object.entries(map)) {
			result[key] = await defaultValue();
		}
		return result as T;
	}
	for (const [key, [keys, resolve, defaultValue]] of Object.entries(map)) {
		let value: any;
		let hit = false;
		for (const k of asArray(keys)) {
			if (!(k in input)) continue;
			const v = await resolve((input as any)[k]);
			if (!hit) {
				value = v;
				hit = true;
				continue;
			}
			if (Array.isArray(value)) value.push(...(v as any));
		}
		if (!hit) value = await defaultValue();
		result[key] = value;
	}
	return result as T;
}
