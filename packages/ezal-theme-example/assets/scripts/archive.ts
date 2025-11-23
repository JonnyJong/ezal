import cloud from 'd3-cloud';
import {
	type HierarchyNode,
	hierarchy,
	treemap,
	treemapSquarify,
} from 'd3-hierarchy';
import { initBase } from './_base';
import { $, $$, debounce, doc, handle, shuffle } from './_utils';

interface Tag extends cloud.Word {
	size: number;
	text: string;
	node: HTMLElement;
}

function initTags() {
	const container = $<HTMLElement>('.tags')!;
	const tags = [...$$<HTMLAnchorElement>('.tags a')];
	let prevWidth = container.clientWidth;
	let layout: ReturnType<typeof cloud<Tag>> | null = null;

	const doLayout = () => {
		if (layout) layout.stop();
		const words = tags.map<Tag>((a) => ({
			text: a.textContent,
			size: Number(a.dataset.size),
			node: a,
		}));
		const totalWeight =
			words.reduce((prev, { size }) => prev + 1 + size * 0.1, 0) * 7000;
		const width = container.clientWidth;
		const height = Math.max(100, totalWeight / width);
		const cx = width / 2;
		const cy = height / 2;
		layout = cloud<Tag>()
			.size([width, height])
			.words(words)
			.padding(4)
			.rotate(0)
			.fontSize((d) => d.size ** 2 + 16)
			.on('end', (words) => {
				layout = null;
				for (const { node, size, x, y } of words) {
					node.style.left = `${x! + cx}px`;
					node.style.top = `${y! + cy}px`;
					node.style.fontSize = `${size}px`;
				}
				container.style.height = `${height}px`;
				container.classList.add('ready');
			});
		layout.start();
	};
	doLayout();
	const handleResize = debounce(doLayout, 50);
	handle(window, 'resize', () => {
		const width = container.clientWidth;
		if (prevWidth === width) return;
		prevWidth = width;
		handleResize();
	});
}

interface CategoryNode {
	size: number;
	node?: HTMLElement;
	children?: CategoryNode[];
}

type CategoryResult = (HierarchyNode<CategoryNode> & {
	x0: number;
	y0: number;
	x1: number;
	y1: number;
})[];

function initCategories() {
	const container = $<HTMLElement>('.categories')!;
	let prevWidth = container.clientWidth;
	const totalSize = $$('a', container).length;

	const collect = (root: HTMLElement): CategoryNode[] =>
		shuffle([...$$<HTMLElement>(':scope>li>a', root)].map(toData));
	const toData = (node: HTMLElement): CategoryNode => {
		let children: CategoryNode[] | undefined;
		if (node.nextSibling) {
			children = collect(node.nextSibling as HTMLElement);
		}
		return {
			size: Number(node.dataset.size),
			node,
			children,
		};
	};
	const root = hierarchy<CategoryNode>({
		children: collect(container),
		size: 0,
	}).sum((d) => d.size);

	const doLayout = () => {
		const width = container.clientWidth;
		const height = Math.max(100, (totalSize * 30000) / (width / 2 + 400)) + 32;
		const layout = treemap<CategoryNode>()
			.tile(treemapSquarify)
			.size([width, height])
			.paddingInner(8)
			.paddingOuter(8)
			.paddingTop(32)
			.round(true);
		layout(root);
		for (const {
			data: { node },
			x0,
			x1,
			y0,
			y1,
		} of root.descendants() as CategoryResult) {
			if (!node) continue;
			node.classList.add('link');
			node.style.left = `${x0}px`;
			node.style.top = `${y0 - 32}px`;
			node.style.width = `${x1 - x0}px`;
			node.style.height = `${y1 - y0}px`;
		}
		container.style.height = `${height - 32}px`;
		container.classList.add('ready');
	};

	doLayout();
	const handleResize = debounce(doLayout, 50);
	handle(window, 'resize', () => {
		const width = container.clientWidth;
		if (prevWidth === width) return;
		prevWidth = width;
		handleResize();
	});
}

handle(doc, 'DOMContentLoaded', () => {
	initBase();
	initTags();
	initCategories();
});
