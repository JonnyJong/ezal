import path from 'node:path';
import {
	type LayoutRenderer as EzalLayoutRenderer,
	getConfig,
	type LayoutCompiled,
	type LayoutConfig,
	normalizeError,
	type PromiseOr,
} from 'ezal';
import { compile, type LayoutRenderer } from 'ezal-layout';
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

function createRenderer(template: LayoutRenderer) {
	return (page: Context['page']): PromiseOr<string | Error> => {
		const { site } = getConfig();
		const theme = getThemeConfig();
		const context: Context = {
			page,
			site,
			theme,
			getImageInfo,
			mime,
			compareByDate,
		};
		try {
			return template(context);
		} catch (error) {
			return normalizeError(error);
		}
	};
}

async function compiler(src: string): Promise<LayoutCompiled | Error> {
	try {
		const { renderer: template, dependencies } = await compile(
			src,
			EXTERNAL_MODULES,
		);
		return {
			renderer: createRenderer(template) as EzalLayoutRenderer,
			dependencies,
		};
	} catch (error) {
		return normalizeError(error);
	}
}

export const layoutConfig: LayoutConfig = {
	root: path.join(__dirname, '../layouts'),
	compiler,
};
