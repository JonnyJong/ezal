/** biome-ignore-all lint/performance/noBarrelFile: Entry file */

import exitHook from 'async-exit-hook';
import { program } from 'commander';
import { version } from '../package.json';
import { build, cleanOutDir, preScan } from './build';
import { initConfig } from './config';
import { hook } from './hooks';
import { Asset } from './items/asset';
import { Page } from './items/page';
import { Logger } from './logger';
import { initServer, stopServer } from './server';
import { initWatcher, stopWatcher } from './watcher';

export {
	defineConfig,
	type EzalConfig,
	getConfig,
	getMode,
	type ServerConfig,
	type SiteConfig,
	type SourceConfig,
	type ThemeConfig,
} from './config';
export * from './items/article';
export * from './items/asset';
export * from './items/category';
export * from './items/layout';
export * from './items/page';
export * from './items/tag';
export * from './items/virtual-assets';
export * from './items/virtual-page';
export { Logger } from './logger';
export * from './types';
export * from './utils/cache';
export { normalizeError } from './utils/error';
export { default as fs } from './utils/fs';
export { escapeHTML } from './utils/html';
export * from './utils/level';
export * from './utils/object';
export * from './utils/path';
export * from './utils/queue';
export * from './utils/time';
export * from './utils/url';

program
	.name('ezal')
	.description('A simple, asynchronous blog framework')
	.version(version);

program
	.command('clean')
	.description('Clean output directory')
	.option('--verbose', 'show detailed output for debugging')
	.action(async (options) => {
		Logger.verbose = options.verbose;
		await initConfig('build');
		await cleanOutDir();
	});

program
	.command('build')
	.alias('b')
	.description('Build blog as static files')
	.option('--clean', 'Clean output directory')
	.option('--dry-run', 'Simulate build process without writing files')
	.option('--verbose', 'show detailed output for debugging')
	.action(async (options) => {
		Logger.verbose = options.verbose;
		await initConfig('build', options.dryRun);
		if (options.clean) await cleanOutDir();
		const start = Date.now();
		Asset.initRule();
		Page.initHandlers();
		await hook('config:after', undefined);
		await hook('scan:before', undefined);
		await preScan();
		await hook('scan:after', undefined);
		await hook('build:before', undefined);
		await build();
		await hook('build:after', undefined);
		const elapsed = (Date.now() - start) / 1000;
		new Logger('build').log(`Finish in ${elapsed.toFixed(3)}s`);
		process.exit(0);
	});

program
	.command('serve')
	.alias('s')
	.description('Start the blog live preview server')
	.option('--verbose', 'show detailed output for debugging')
	.action(async (options) => {
		Logger.verbose = options.verbose;
		await initConfig('serve');
		Asset.initRule();
		Page.initHandlers();
		await hook('config:after', undefined);
		await hook('scan:before', undefined);
		await preScan();
		await hook('scan:after', undefined);
		initWatcher();
		initServer();
		exitHook(async (done) => {
			console.log('quitting...');
			await hook('preview:stop', undefined);
			await Promise.allSettled([stopServer(), stopWatcher()]);
			process.exitCode = 0;
			done();
		});
	});

if (require.main === module) program.parse();
