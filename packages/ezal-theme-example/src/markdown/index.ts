import { fs, Logger, type PageHandler } from 'ezal';
import {
	type CommonPlugin,
	EzalMarkdown,
	extractFrontmatter,
	plugins,
} from 'ezal-markdown';
import { getThemeConfig } from '../config';
import { codeblock } from './codeblock';
import { fold } from './fold';
import { footnote } from './footnote';
import { image } from './image';
import { kbd } from './kbd';
import { link } from './link';
import { links } from './links';
import { note } from './note';
import { table } from './table';
import { tabs } from './tabs';
import { tex } from './tex';

const logger = new Logger('markdown');

const renderer = new EzalMarkdown();
renderer.logger = {
	debug(data) {
		logger.debug(`[${data.name}]`, data.message, data.errObj);
	},
	info(data) {
		logger.log(`[${data.name}]`, data.message, data.errObj);
	},
	warn(data) {
		// HACK: 忽略因脚注引起的警告
		if (
			data.name === 'link-reference-define' &&
			data.message.includes('label ^')
		) {
			return;
		}
		logger.warn(`[${data.name}]`, data.message, data.errObj);
	},
	error(data) {
		logger.error(`[${data.name}]`, data.message, data.errObj);
	},
};

const setext: CommonPlugin<'block'> = {
	name: 'setext-heading',
	type: 'block',
	order: 0,
	priority: 0,
	start: () => null,
	parse: () => null,
	render: () => '',
};

export async function markdownPageHandler(): Promise<PageHandler> {
	renderer.set(
		plugins.heading({ shiftLevels: true }),
		image,
		table,
		await codeblock(),
		footnote,
		tex,
		tabs,
		note,
		fold,
		kbd,
		links,
		setext,
		link,
	);
	return {
		exts: '.md',
		async parser(src) {
			const file = await fs.readFile(src);
			if (file instanceof Error) return file;
			const frontmatter = await extractFrontmatter(file);
			let data = frontmatter?.data as Record<string, any>;
			if (typeof data !== 'object') data = {};
			const content = file.slice(frontmatter?.raw.length ?? 0);
			return { content, data };
		},
		async renderer(content, page) {
			const config = getThemeConfig();
			const result = await renderer.renderHTML(content, {
				lineBreak: config.markdown?.lineBreak,
				shared: { page } as any,
			});
			return {
				html: result.html,
				data: result.context,
			};
		},
	};
}
