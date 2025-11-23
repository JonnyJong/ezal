import { escapeHTML, type Page, URL } from 'ezal';
import {
	type ASTPlugin,
	ImageNode,
	Paragraph,
	type Parsed,
	ParsedNode,
	type RendererPlugin,
	utils,
} from 'ezal-markdown';
import mime from 'mime-types';
import { getImageInfo, type ImageInfo } from '../image';

const { $ } = utils;

function img(
	info: ImageInfo | null,
	src: string,
	alt: string,
	title?: string,
): string {
	return $('img', {
		attr: {
			src: URL.for(src),
			alt,
			width: info?.metadata?.width,
			height: info?.metadata?.height,
			loading: 'lazy',
			title,
		},
		style: { $imgColor: info?.metadata?.color },
	});
}

interface ImageParsed extends Parsed {
	title?: string;
	alt: string;
	url: string;
}

function renderImage(
	url: string,
	alt: string,
	title: string | undefined,
	page: Page,
): string {
	const info = getImageInfo(URL.resolve(page.url, url));
	if (!info?.rule) return img(info, url, alt, title);
	const html: string[] = info.rule.slice(0, -1).map((ext) =>
		$('source', {
			attr: { srcset: URL.extname(url, `.opt${ext}`), type: mime.lookup(ext) },
		}),
	);
	html.push(img(info, URL.extname(url, info.rule.at(-1)!), alt, title));
	return $('picture', html);
}

const blockRender: RendererPlugin<'block', ImageParsed> = {
	name: 'image',
	type: 'block',
	render({ title, url, alt }, { shared, counter }) {
		const page = shared.page as any as Page;
		const html: string[] = [renderImage(url, alt, title, page)];
		html.push($('figcaption', { content: alt }));
		counter.count(alt);
		return $('figure', { class: 'image', html });
	},
};

const block: ASTPlugin<'inline', ParsedNode> = {
	name: 'image-post',
	type: 'inline',
	phase: 'post',
	priority: -1,
	parse(root) {
		if (!(root instanceof Paragraph)) return;
		if (root.size !== 1) return;
		const child = root.child(0);
		if (!(child instanceof ImageNode)) return;
		const alt = child
			.entires()
			.map((node) => node.raw ?? '')
			.toArray()
			.join('');
		const image = new ParsedNode('image', 'block', {
			raw: child.raw ?? '',
			title: child.title,
			alt: escapeHTML(alt),
			url: child.destination,
		} as ImageParsed);
		root.before(image);
		root.remove();
	},
	verifyNode: (_node): _node is ParsedNode => false,
	render: () => '',
};

const inline: ASTPlugin<'inline', ImageNode> = {
	name: 'image',
	type: 'inline',
	phase: 'post',
	priority: 1,
	parse() {},
	verifyNode(node): node is ImageNode {
		return node instanceof ImageNode;
	},
	render(node, { shared }) {
		const page = shared.page as any as Page;
		const { destination, title } = node;
		const alt = escapeHTML(
			node
				.entires()
				.map((node) => node.html)
				.toArray()
				.join(''),
		);
		return renderImage(destination, alt, title, page);
	},
};

export const image = { block, blockRender, inline };
