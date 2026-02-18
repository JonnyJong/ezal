import path from 'node:path';
import { getConfig } from './config';
import { hook } from './hooks';
import { Article } from './items/article';
import { Asset } from './items/asset';
import { Page } from './items/page';
import { VirtualAssets } from './items/virtual-assets';
import { VirtualPage } from './items/virtual-page';
import { Logger } from './logger';
import type { Route } from './route';
import type { AssetLevel } from './types';
import fs, { traverseDir } from './utils/fs';
import { runParallel } from './utils/function';

const logger = new Logger('build');

export async function cleanOutDir() {
	logger.log('Cleaning output directory...');
	const { outDir } = getConfig();
	logger.debug(`Removing ${outDir}`);
	const result = await fs.remove(outDir);
	if (result instanceof Error) logger.fatal(result);
}

export async function addAsset(
	file: string,
	level: Exclude<AssetLevel, 'virtual'>,
) {
	if (level === 'user') {
		const article = await Article.add(file);
		if (article) return;
		const page = await Page.add(file);
		if (page) return;
	}
	await Asset.add(file, level);
}

export async function preScan() {
	const { source, theme } = getConfig();
	logger.log('Scanning Theme Assets...');
	logger.debug(theme.assetsRoot);
	for await (const file of traverseDir(theme.assetsRoot)) {
		logger.debug('Find', file);
		addAsset(file, 'theme');
	}
	logger.log('Scanning User Assets...');
	logger.debug(source.root);
	for await (const file of traverseDir(source.root)) {
		logger.debug('Find', file);
		addAsset(file, 'user');
	}
	logger.log('Pre-scan complete');
}

async function output(route: Route) {
	const content = await route.getContent();
	const dist = route.dist;
	const out = path.join(getConfig().outDir, dist);
	await fs.writeFile(out, content);
	logger.log('\t', dist);
}

export async function build() {
	logger.log('[0/6] Building Theme Assets...');
	await hook('build:before:assets-theme', undefined);
	await runParallel(Asset.getAll('theme'), output);
	await hook('build:after:assets-theme', undefined);

	logger.log('[1/6] Building User Assets...');
	await hook('build:before:assets-user', undefined);
	await runParallel(Asset.getAll('user'), output);
	await hook('build:after:assets-user', undefined);

	logger.log('[2/6] Building Articles...');
	await hook('build:before:articles', undefined);
	await runParallel(Article.getAll(), output);
	await hook('build:after:articles', undefined);

	logger.log('[3/6] Building Pages...');
	await hook('build:before:pages', undefined);
	await runParallel(Page.getAll(), output);
	await hook('build:after:pages', undefined);

	logger.log('[4/6] Building Virtual Assets...');
	await hook('build:before:assets-virtual', undefined);
	await runParallel(VirtualAssets.getAll(), output);
	await hook('build:after:assets-virtual', undefined);

	logger.log('[5/6] Building Virtual Pages...');
	await hook('build:before:pages-virtual', undefined);
	await runParallel(VirtualPage.getAll(), output);
	await hook('build:after:pages-virtual', undefined);

	logger.log('[6/6] Build complete');
}
