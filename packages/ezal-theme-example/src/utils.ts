import type { Article } from 'ezal';

export function compareByDate(a: Article, b: Article): number {
	return b.date.epochMilliseconds - a.date.epochMilliseconds;
}
