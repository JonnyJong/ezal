import { Temporal } from '@js-temporal/polyfill';
import { defineConfig } from 'ezal';
import { theme } from 'ezal-theme-example';

export default defineConfig(async () => ({
	site: {
		title: 'Ezal Blog Framework',
		author: 'Jonny',
		language: 'zh',
		domain: 'https://jonnyjong.github.io',
		root: '/ezal',
	},
	source: {
		root: 'src',
		article: 'docs',
	},
	outDir: 'dist',
	theme: await theme({
		favicon: ['/favicon.svg'],
		nav: [
			{ name: '首页', link: '/' },
			{ name: '归档', link: '/archive/' },
			{ name: '链接', link: '/links/' },
			{ name: '关于', link: '/about/' },
		],
		since: Temporal.ZonedDateTime.from({
			year: 2025,
			month: 11,
			day: 8,
			hour: 21,
			minute: 40,
			second: 0,
			timeZone: 'Asia/Shanghai',
		}),
		contact: [
			{
				color: '#444',
				icon: 'github',
				name: 'Github',
				url: 'https://github.com/JonnyJong/ezal',
			},
			{
				color: '#d67c00',
				icon: 'rss',
				name: 'Atom',
				url: '/atom.xml',
			},
		],
		links: [
			{
				title: '链接',
				description: '博客示例',
				items: [
					{
						name: `Jonny's Blog`,
						description: '欢迎光临小站',
						link: 'https://jonnys.top/',
						avatar: 'https://jonnys.top/img/avatar.svg',
						color: '#00AA00',
					},
				],
			},
		],
		inject: '<link rel="stylesheet" href="/ezal/icon/index.css">',
		home: {
			slogan: 'Welcome!👋<br>Here is the demo site of ezal blog framework.',
		},
	}),
	server: {
		port: 9090,
		host: '0.0.0.0',
		autoReload: true,
	},
}));
