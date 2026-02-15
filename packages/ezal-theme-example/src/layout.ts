import path from 'node:path';
import { getConfig, type LayoutConfig } from 'ezal';
import { createCompiler } from 'ezal-layout';
import mime from 'mime-types';
import type { Context } from '../layouts/context';
import { getThemeConfig } from './config';
import { getImageInfo } from './image';
import { compareByDate } from './utils';

const EXTERNAL_MODULES = Object.fromEntries(
	['mime-types', 'ezal', '@js-temporal/polyfill'].map<[string, any]>((name) => [
		name,
		require(name),
	]),
);

export const layoutConfig: LayoutConfig = {
	root: path.join(__dirname, '../layouts'),
	compiler: createCompiler({
		context(page): Context {
			const { site } = getConfig();
			const theme = getThemeConfig();
			return {
				page: page as Context['page'],
				site,
				theme,
				getImageInfo,
				mime,
				compareByDate,
			};
		},
		external: EXTERNAL_MODULES,
	}),
};
