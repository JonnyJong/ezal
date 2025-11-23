import path from 'node:path';
import { type FSWatcher, watch } from 'chokidar';
import type { EventName } from 'chokidar/handler.js';
import { addAsset } from './build';
import { getConfig } from './config';
import { type DependencyChangeType, Dependent } from './items/dependent';
import { Logger } from './logger';
import { isSubPath } from './utils/path';

const ALLOWED_FS_EVENTS: EventName[] = ['add', 'change', 'unlink'];

const INFO = {
	INIT: 'Initializing file system watcher...',
	ADDED: (scope: string, path: string) => `Added ${scope} resource: ${path}`,
	UPDATE: (scope: string, path: string) => `${scope} resource updated: ${path}`,
	REMOVE: (scope: string, path: string) => `${scope} resource removed: ${path}`,
} as const;

const logger = new Logger('watcher');

let watcher: FSWatcher | undefined;

function resolveFilepath(
	filepath: string,
): [src: string, scope: 'user' | 'theme' | null] {
	const config = getConfig();
	if (isSubPath(config.source.root, filepath)) {
		return [path.relative(config.source.root, filepath), 'user'];
	}
	if (isSubPath(config.theme.assetsRoot, filepath)) {
		return [path.relative(config.theme.assetsRoot, filepath), 'theme'];
	}
	return ['', null];
}

const EVENT_TYPE_MAP: Record<string, DependencyChangeType> = {
	add: 'add',
	change: 'update',
	unlink: 'rm',
};

function emit(event: EventName, filepath: string) {
	const [src, scope] = resolveFilepath(filepath);
	if (!scope) {
		Dependent.emit([filepath, EVENT_TYPE_MAP[event]]);
		return;
	}
	if (event === 'add') {
		Dependent.emit([filepath, 'add']);
		addAsset(src, scope);
		logger.log(INFO.ADDED(scope, src));
		return;
	}
	if (event === 'change') {
		Dependent.emit([filepath, 'update']);
		logger.log(INFO.UPDATE(scope, src));
		return;
	}
	if (event === 'unlink') {
		Dependent.emit([filepath, 'rm']);
		logger.log(INFO.REMOVE(scope, src));
		return;
	}
}

export function initWatcher() {
	logger.log(INFO.INIT);
	const config = getConfig();
	const watchList = [
		config.source.root,
		config.theme.assetsRoot,
		config.theme.layout.root,
	];
	logger.debug(watchList);
	watcher = watch(watchList, {
		awaitWriteFinish: true,
		ignoreInitial: true,
		ignorePermissionErrors: true,
	});
	watcher.on('all', (event, filepath) => {
		if (!ALLOWED_FS_EVENTS.includes(event)) return;
		emit(event, filepath);
	});
}

export async function stopWatcher() {
	if (!watcher) return;
	return await watcher.close();
}
