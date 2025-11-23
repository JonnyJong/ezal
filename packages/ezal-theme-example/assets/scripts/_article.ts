import Hammer from 'hammerjs';
import { $, $$, $new, doc, handle, offHandle, sleep } from './_utils';

export function initTabs() {
	handle(doc, 'change', (event) => {
		let target: Element | null = event.target as Element;
		if (!(target instanceof HTMLInputElement)) return;
		if (target.type !== 'radio') return;
		if (!target.id.startsWith('tab')) return;
		if (!target.name.startsWith('tab')) return;
		target = target.parentElement;
		if (!target) return;
		const content = target.parentElement?.nextElementSibling;
		if (!(content instanceof HTMLElement)) return;
		for (const element of $$(':scope>.active', content)) {
			element.classList.remove('active');
		}
		const index = [...target.parentElement!.children].indexOf(target);
		content.children.item(index)?.classList.add('active');
	});
}

export function initToc() {
	const toc = [...$$('aside a')];
	if (toc.length === 0) return;
	const headings = [...$$('h2,h3,h4,h5,h6', $('article')!)];
	const docE = doc.documentElement;

	function getIndex(): number {
		if (docE.scrollTop < 100) return 0;
		if (docE.scrollTop + innerHeight >= docE.scrollHeight - 5) {
			return toc.length - 1;
		}

		const triggerLine = innerHeight / 3;
		for (const [i, heading] of headings.entries()) {
			const { top } = heading.getBoundingClientRect();
			if (top > triggerLine) return Math.max(0, i - 1);
		}
		return toc.length - 1;
	}

	handle(doc, 'scroll', () => {
		const index = getIndex();
		const target = toc[index];

		if (target.classList.contains('active')) return;
		for (const element of $$('aside .active')) {
			element.classList.remove('active');
		}
		target.classList.add('active');
		target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	});

	const nav = $<HTMLElement>('nav')!;
	const mobileToc = $('.toc')!.cloneNode(true) as HTMLElement;
	nav.append(mobileToc);
	const height = () => {
		nav.style.maxHeight = `${nav.scrollHeight}px`;
	};
	handle(window, 'resize', height);
	for (const a of $$('a', mobileToc)) {
		handle(a, 'click', async () => {
			nav.classList.remove('nav-show');
			await sleep(10);
			nav.classList.add('nav-hide');
		});
	}
	height();
}

export function initCodeblock(scope: ParentNode = doc) {
	for (const btn of $$<HTMLButtonElement>('.code button', scope)) {
		handle(btn, 'click', async () => {
			await navigator.clipboard.writeText(
				btn.parentNode!.nextSibling!.textContent!,
			);
			btn.classList.replace('icon-copy', 'icon-check');
			await sleep(1000);
			btn.classList.replace('icon-check', 'icon-copy');
		});
	}
}

export function initFootnote() {
	let hoveringRef = false;
	let hoveringPreview = false;
	const preview = $new('div');
	preview.className = 'preview rounded';
	async function refIn(this: HTMLAnchorElement) {
		const [_, id] = this.href.split('#');
		if (!id) return;
		const dt = doc.getElementById(id);
		if (!dt) return;
		const dd = dt.nextSibling as HTMLElement;
		if (dd?.tagName !== 'DD') return;
		preview.replaceChildren(dd.cloneNode(true));
		initCodeblock(preview);
		for (const label of $$<HTMLLabelElement>('.tab-nav label', preview)) {
			label.htmlFor += '-copy';
		}
		for (const radio of $$<HTMLInputElement>('.tab-nav input', preview)) {
			radio.id += '-copy';
			radio.name += '-copy';
		}
		doc.body.append(preview);
		hoveringRef = true;

		await sleep();

		const { width, height } = preview.getBoundingClientRect();
		const { top, right, bottom, left } = this.getBoundingClientRect();
		if (left + width <= innerWidth) {
			preview.style.left = `${left}px`;
		} else if (right - width >= 0) {
			preview.style.left = `${right - width}px`;
		} else {
			preview.style.left = `${innerWidth - width}px`;
		}
		if (bottom + height + 8 <= innerHeight) {
			preview.style.top = `${bottom + 8}px`;
		} else if (top - height >= 0) {
			preview.style.top = `${top - height}px`;
		} else {
			preview.style.top = '0px';
		}
		preview.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 100 });
	}
	async function refOut(this: HTMLAnchorElement) {
		hoveringRef = false;
		await sleep(100);
		if (hoveringPreview || hoveringRef) return;
		preview.animate([{ opacity: 0 }], { duration: 100 }).onfinish = () =>
			preview.remove();
	}
	for (const ref of $$<HTMLAnchorElement>('article .footnote')) {
		handle(ref, 'mouseenter', refIn);
		handle(ref, 'mouseout', refOut);
		handle(ref, 'focusin', refIn);
		handle(ref, 'focusout', refOut);
	}
	handle(preview, 'mouseenter', () => {
		hoveringPreview = true;
	});
	handle(preview, 'mouseleave', async () => {
		hoveringPreview = false;
		await sleep(100);
		if (hoveringPreview || hoveringRef) return;
		preview.animate([{ opacity: 0 }], { duration: 100 }).onfinish = () =>
			preview.remove();
	});
}

function display(image: HTMLImageElement) {
	const { top, left, width, height } = image.getBoundingClientRect();
	const naturalWidth = image.naturalWidth;
	const naturalHeight = image.naturalHeight;
	const realWidth = (naturalWidth / naturalHeight) * height;
	const realLeft = left + (width - realWidth) / 2;
	const boxFrame = { background: '#0000' };
	const defaultDuration: number = 100;
	let currentWidth = 0;
	let currentHeight = 0;
	const box = $new('div');
	box.classList.add('img-scale');
	const img = $new('img');
	box.append(img);
	img.src = image.currentSrc;
	img.width = naturalWidth;
	img.height = naturalHeight;
	img.draggable = false;

	let currentX = 0;
	let currentY = 0;
	let currentScale = 1;

	const hammer = new Hammer(box, {
		recognizers: [
			[Hammer.Tap, { time: 250, threshold: 10 }],
			[Hammer.Pan, { direction: Hammer.DIRECTION_ALL, threshold: 1 }],
			[Hammer.Pinch, { enable: true }],
		],
	});
	hammer.get('pinch').recognizeWith('pan');
	hammer.get('pan').recognizeWith('pinch');

	const hide = () => {
		const { top, left, width, height } = image.getBoundingClientRect();
		const realWidth = (naturalWidth / naturalHeight) * height;
		const realLeft = left + (width - realWidth) / 2;
		img.animate(
			{
				top: `${top}px`,
				left: `${realLeft}px`,
				width: `${realWidth}px`,
				scale: 1,
				translate: '0px 0px',
			},
			defaultDuration,
		);
		const animation = box.animate(boxFrame, defaultDuration);
		animation.onfinish = () => {
			box.remove();
			image.style.opacity = '';
		};
		animation.play();
		hammer.destroy();
		offHandle(window, 'resize', resize);
	};

	const fitScale = () => {
		const min =
			Math.min(innerWidth / currentWidth, innerHeight / currentHeight, 1) / 2;
		const max =
			Math.max(currentWidth / innerWidth, currentHeight / innerHeight) * 8;
		currentScale = Math.min(Math.max(currentScale, min), max);
		img.style.scale = `${currentScale}`;
	};

	const fitPosition = () => {
		const displayWidth = currentWidth * currentScale;
		const displayHeight = currentHeight * currentScale;
		const limitX = Math.max((displayWidth - innerWidth) / 2, 0);
		currentX = Math.min(Math.max(currentX, -limitX), limitX);
		const limitY = Math.max((displayHeight - innerHeight) / 2, 0);
		currentY = Math.min(Math.max(currentY, -limitY), limitY);
		img.style.translate = `${currentX}px ${currentY}px`;
	};

	const resize = () => {
		currentWidth = Math.min(
			naturalWidth,
			innerWidth,
			(innerHeight / naturalHeight) * naturalWidth,
		);
		currentHeight = (naturalHeight / naturalWidth) * currentWidth;
		img.style.top = `${(innerHeight - currentHeight) / 2}px`;
		img.style.left = `${(innerWidth - currentWidth) / 2}px`;
		img.style.width = `${currentWidth}px`;
		fitPosition();
		fitScale();
	};

	resize();
	doc.body.append(box);
	box.animate([boxFrame, {}], defaultDuration).play();
	img
		.animate(
			[
				{
					top: `${top}px`,
					left: `${realLeft}px`,
					width: `${realWidth}px`,
				},
				{},
			],
			{ duration: 300, easing: 'ease-in-out' },
		)
		.play();
	image.style.opacity = '0';

	let dragging = false;

	// 点击
	let tapTimer: number | null = null;
	hammer.on('tap', ({ pointerType }) => {
		if (pointerType !== 'touch') return hide();
		if (tapTimer === null) {
			tapTimer = setTimeout(hide, 200);
			return;
		}
		clearTimeout(tapTimer);
		tapTimer = null;
		const prev = currentScale;
		if (currentScale < 4) currentScale *= 2;
		else currentScale = 1;
		img.style.scale = `${currentScale}`;
		img.animate([{ scale: prev }, {}], defaultDuration);
	});
	// 滚轮缩放
	handle(box, 'wheel', (event: WheelEvent) => {
		if (event.deltaY < 0) currentScale *= 1.5;
		else currentScale /= 1.5;
		fitScale();
		if (!dragging) fitPosition();
	});
	// 缩放 & 移动
	hammer.on('pan pinch', ({ deltaX, deltaY, scale }) => {
		dragging = true;
		img.style.translate = `${currentX + deltaX}px ${currentY + deltaY}px`;
		img.style.scale = `${currentScale * scale}`;
	});
	hammer.on('panend', ({ deltaX, deltaY }) => {
		currentX += deltaX;
		currentY += deltaY;
		dragging = false;
		const prevX = currentX;
		const prevY = currentY;
		fitPosition();
		img.animate([{ translate: `${prevX}px ${prevY}px` }, {}], defaultDuration);
	});
	hammer.on('pinchend', ({ scale }) => {
		currentScale *= scale;
		const prev = currentScale;
		fitScale();
		img.animate([{ scale: prev }, {}], defaultDuration);
	});
	handle(window, 'resize', resize);
}

export function initImage() {
	for (const image of $$<HTMLImageElement>('.image img')) {
		handle(image, 'click', () => display(image));
	}
}
