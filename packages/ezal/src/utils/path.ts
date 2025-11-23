import path from 'node:path';

export function isSubPath(parent: string, child: string): boolean {
	if (!path.relative(child, parent).startsWith('..')) return false;
	const relative = path.relative(parent, child);
	if (relative.startsWith('..')) return false;
	return !path.isAbsolute(relative);
}
