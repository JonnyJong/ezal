import { URL } from 'ezal';
import { type CommonPlugin, type Parsed, utils } from 'ezal-markdown';

interface Link {
	href: string;
	icon?: string;
	title: string;
	subtitle?: string;
}

interface LinksParsed extends Parsed {
	links: Link[];
}

const PATTERN_ALL = /(?<=^|\n)@@\n.*?\n@@(\n|$)/s;
const PATTERN_EACH = /(?<=^|\n)@ ?([^@\n].*\n){2,3}/g;
const PATTERN_WHITESPACE = /\s+/;

const { $ } = utils;

export const links: CommonPlugin<'block', LinksParsed> = {
	name: 'links',
	type: 'block',
	order: 0,
	priority: 0,
	start: PATTERN_ALL,
	parse(source) {
		const matched = source.match(PATTERN_ALL);
		if (!matched) return;
		const raw = matched[0];
		const links = [
			...raw.matchAll(PATTERN_EACH).map<Link>((matched) => {
				const lines = matched[0].split('\n');
				const args = lines[0].slice(1).trim().split(PATTERN_WHITESPACE);
				return {
					href: args[0],
					icon: args[1],
					title: lines[1],
					subtitle: lines[2],
				};
			}),
		];
		return { raw, links };
	},
	render({ links }, { counter }) {
		const html = links.map<string>(({ href, icon, title, subtitle }) => {
			const html: string[] = [$('i', { class: ['icon-link'] })];
			if (icon) {
				html.push($('img', { class: 'rounded', attr: { src: icon, alt: title } }));
			}
			html.push($('div', { class: 'link-title', content: title }));
			counter.count(title);
			if (subtitle) {
				html.push($('div', { content: subtitle }));
				counter.count(subtitle);
			}
			return $('a', { class: 'rounded', html, attr: { href: URL.for(href) } });
		});
		return $('div', { class: 'links', html });
	},
};
