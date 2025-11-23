import type * as PageFind from '@pagefind';
import { $, $new, handle } from './_utils';

let pagefind: typeof PageFind;
let dialog: HTMLDialogElement;
let input: HTMLInputElement;
let resultList: HTMLElement;

function renderResult(
	result: PageFind.PagefindSearchFragment,
	node: HTMLAnchorElement,
) {
	node.href = result.url;
	const title = $new('div');
	title.classList.add('search-title');
	title.textContent = result.meta.title;
	const excerpt = $new('div');
	excerpt.innerHTML = result.excerpt;
	excerpt.classList.add('search-excerpt');
	node.append(title, excerpt);
}

async function search() {
	if (!pagefind) return;
	const result = await pagefind.debouncedSearch(input.value);
	if (!result) return;
	resultList.replaceChildren(
		...result.results.map(({ data }, i) => {
			const node: HTMLAnchorElement = $new('a');
			if (i === 0) node.classList.add('active');
			data().then((result) => renderResult(result, node));
			return node;
		}),
	);
}

async function loadPagefind() {
	if (pagefind) return;
	pagefind = (await import('../pagefind.js' as any)) as typeof PageFind;
	pagefind.init();
	$('.search progress')?.remove();
	(window as any).pagefind = pagefind;
	search();
}

function openSearchDialog() {
	dialog.showModal();
	loadPagefind();
}

function navHandler(event: KeyboardEvent) {
	let current = $<HTMLAnchorElement>('.active', resultList);
	if (event.key === 'Enter') {
		current?.click();
		return;
	}
	const down = event.key === 'ArrowDown';
	if (!down && event.key !== 'ArrowUp') return;
	event.preventDefault();
	if (current) current.classList.remove('active');
	if (down) current = current?.nextSibling as HTMLAnchorElement;
	else current = current?.previousSibling as HTMLAnchorElement;
	if (!current) {
		if (down) current = [...resultList.children].at(-1) as HTMLAnchorElement;
		else current = resultList.children[0] as HTMLAnchorElement;
	}
	if (!current) return;
	current.classList.add('active');
	current.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function dialogClickHandler({ x, y }: MouseEvent) {
	const { top, right, bottom, left } = dialog.getBoundingClientRect();
	if (x <= right && x >= left && y <= bottom && y >= top) return;
	dialog.close();
}

export function initSearch() {
	const searchBtn = $('#search')!;
	dialog = $('.search')!;
	input = $('#search-input')!;
	resultList = $('.search-result')!;
	handle($('#search-close')!, 'click', () => dialog.close());
	handle(searchBtn, 'click', openSearchDialog);
	handle(input, 'input', search);
	handle(input, 'keydown', navHandler);
	handle(dialog, 'click', dialogClickHandler);
}
