/** biome-ignore-all lint/style/useNamingConvention: Declare Elements */

/**
 * 文档根元素
 * @description
 * <!DOCTYPE html>
 * <html>
 * </html>
 */
declare const Doc: (
	props: JSX.IntrinsicAttributes & JSX.IntrinsicElements['Doc'],
) => JSX.Element;

/**
 * 原始 HTML 元素
 * @description
 * 该节点没有子元素
 */
declare const RawHTML: (
	props: JSX.IntrinsicElements['RawHTML'],
) => JSX.Element & { html: string };

/** 容器元素 */
declare const Container: () => JSX.Element;

declare namespace JSX {
	type ArrayOr<T> = T | T[];

	type Props<T> = T & { [name: string]: any };
	type VoidProps<T> = Props<T> & { children?: never };

	interface Element {
		readonly name: string;
		attr: Record<string, any>;
		readonly parent: Element | null;
		readonly children: readonly (Element | string)[];
		/**
		 * 获取索引对应的子节点
		 * @description
		 * 允许正数和负数索引，负数从节点列表的最后一个元素开始倒数
		 */
		child(index: number): Element | string | null;
		/**
		 * 获取当前节点在父节点的子节点列表中的索引值
		 * @description
		 * 若当前节点无父节点，返回 -1
		 */
		getIndex(): number;
		/** 检查 node 是否为当前节点或当前节点的后代节点 */
		contains(node: Element): boolean;
		/**
		 * 替换当前节点的子节点列表
		 * @returns
		 * 若替换的节点中包含当前节点或当前节点的祖先节点时，
		 * 替换不会执行，并返回 false
		 */
		replace(...nodes: (Element | string)[]): boolean;
		/**
		 * 在当前节点的子节点列表中特定索引插入一系列节点
		 * @description
		 * 允许正数和负数索引，负数从节点列表的最后一个元素开始倒数；
		 * 若索引位置超出边界，则自动将索引限制到边界值；
		 * 插入的节点会从父节点中移除；
		 * @returns
		 * 若插入的节点中包含当前节点或当前节点的祖先节点时，
		 * 替换不会执行，并返回 false
		 * @example
		 * index === 0 || index <= -3;
		 * <this>
		 * 	// 在此处插入
		 *  <child/>
		 *  <child/>
		 * </this>
		 * @example
		 * index = -1 || index >= 2;
		 * <this>
		 *  <child/>
		 *  <child/>
		 * 	// 在此处插入
		 * </this>
		 */
		insert(index: number, ...nodes: (Element | string)[]): boolean;
		/**
		 * 在父节点的子节点列表中，该节点前插入一系列节点
		 * @returns
		 * 若当前节点无父节点，
		 * 或插入的节点中包含当前节点或当前节点的祖先节点时，
		 * 替换不会执行，并返回 false
		 * @example
		 * <parent>
		 * 	// 在此处插入
		 *  <this/>
		 * </parent>
		 */
		before(...nodes: Element[]): boolean;
		/**
		 * 在当前节点的子节点列表开头插入一系列节点
		 * @returns
		 * 若插入的节点中包含当前节点或当前节点的祖先节点时，
		 * 替换不会执行，并返回 false
		 * @example
		 * <this>
		 * 	// 在此处插入
		 *  <child/>
		 * </this>
		 */
		prepend(...nodes: Element[]): boolean;
		/**
		 * 在当前节点的子节点列表结尾插入一系列节点
		 * @returns
		 * 若插入的节点中包含当前节点或当前节点的祖先节点时，
		 * 替换不会执行，并返回 false
		 * @example
		 * <this>
		 *  <child/>
		 * 	// 在此处插入
		 * </this>
		 */
		append(...nodes: Element[]): boolean;
		/**
		 * 在父节点的子节点列表中，该节点后插入一系列节点
		 * @returns
		 * 若当前节点无父节点，
		 * 或插入的节点中包含当前节点或当前节点的祖先节点时，
		 * 替换不会执行，并返回 false
		 * @example
		 * <parent>
		 *  <this/>
		 * 	// 在此处插入
		 * </parent>
		 */
		after(...nodes: Element[]): boolean;
		/**
		 * 从父节点的节点列表中移除该节点
		 * @returns 若当前节点无父节点，返回 false
		 */
		remove(): boolean;
		/** 获取上一个相邻的节点 */
		prev(): Element | string | null;
		/** 获取下一个相邻的节点 */
		next(): Element | string | null;
	}

	interface ElementClass {
		never: never;
	}

	type CSSProperty = {
		[Key in keyof CSSStyleDeclaration & string]?: any;
	};
	type CSSVariable = {
		[key: `--${string}` | `$${string}`]: any;
	};

	interface IntrinsicAttributes {
		accesskey?: string;
		autofocus?: boolean;
		class?: string | string[] | Record<string, boolean | undefined | null>;
		contenteditable?: boolean | 'true' | 'false' | 'plaintext-only' | '';
		[data: `data-${string}`]: any;
		dir?: 'ltr' | 'rtl' | 'auto';
		draggable?: boolean | 'auto' | 'true' | 'false';
		enterkeyhint?:
			| 'enter'
			| 'done'
			| 'go'
			| 'next'
			| 'previous'
			| 'search'
			| 'send';
		exportparts?: string;
		hidden?: boolean;
		id?: string;
		inert?: boolean;
		is?: string;
		itemid?: string;
		itemprop?: string;
		itemref?: string;
		itemscope?: boolean;
		itemtype?: string;
		lang?: string;
		nonce?: string;
		part?: string;
		popover?: 'auto' | 'manual' | '';
		slot?: string;
		spellcheck?: boolean;
		style?: string | (CSSProperty & CSSVariable);
		tabindex?: number;
		title?: string;
		translate?: '' | 'yes' | 'no';
	}

	interface IntrinsicElements {
		/**
		 * 文档根元素
		 * @description
		 * <!DOCTYPE html>
		 * <html>
		 * </html>
		 */
		Doc: Props<{ xmlns?: string }>;
		/**
		 * 原始 HTML 元素
		 * @description
		 * 该节点没有子元素
		 */
		RawHTML: { html: string; children?: never };
		/** 容器元素 */
		Container: Props<{}>;
		a: Props<{
			download?: string;
			href?: string | URL;
			rel?: string;
			target?: '_self' | '_blank' | '_parent' | '_top';
			type?: string;
		}>;
		abbr: Props<{}>;
		address: Props<{}>;
		area: VoidProps<{
			alt?: string;
			coords?: string;
			download?: string;
			href?: string | URL;
			rel?: string;
			shape?: 'rect' | 'circle' | 'poly' | 'default';
			target?: '_self' | '_blank' | '_parent' | '_top';
		}>;
		article: Props<{}>;
		aside: Props<{}>;
		audio: Props<{
			autoplay?: boolean;
			controls?: boolean;
			loop?: boolean;
			muted?: boolean;
			preload?: 'none' | 'metadata' | 'auto' | '';
			src?: string | URL;
		}>;
		b: Props<{}>;
		base: VoidProps<{
			href?: string | URL;
			target?: '_self' | '_blank' | '_parent' | '_top';
		}>;
		bdi: Props<{}>;
		bdo: Props<{}>;
		blockquote: Props<{
			cite?: string | URL;
		}>;
		body: Props<{}>;
		br: VoidProps<{}>;
		button: Props<{
			disabled?: boolean;
			form?: string;
			formaction?: string | URL;
			formenctype?:
				| 'application/x-www-form-urlencoded'
				| 'multipart/form-data'
				| 'text/plain';
			formmethod?: 'post' | 'get';
			formtarget?: '_self' | '_blank' | '_parent' | '_top';
			name?: string;
			type?: 'submit' | 'reset' | 'button';
			value?: any;
		}>;
		canvas: Props<{ height?: number; width?: number }>;
		caption: Props<{}>;
		cite: Props<{}>;
		code: Props<{}>;
		col: Props<{ span?: number }>;
		colgroup: Props<{ span?: number }>;
		data: Props<{ value?: any }>;
		datalist: Props<{}>;
		dd: Props<{}>;
		del: Props<{ cite?: string | URL; datetime?: string | Date }>;
		details: Props<{ open?: boolean }>;
		dfn: Props<{}>;
		dialog: Props<{ open?: boolean }>;
		div: Props<{}>;
		dl: Props<{}>;
		dt: Props<{}>;
		em: Props<{}>;
		embed: VoidProps<{
			height?: number;
			width?: number;
			src?: string | URL;
			type?: string;
		}>;
		fieldset: Props<{ disabled?: boolean; form?: string; name?: string }>;
		figcaption: Props<{}>;
		figure: Props<{}>;
		footer: Props<{}>;
		form: Props<{
			autocomplete?: 'on' | 'off';
			name?: string;
			rel?: string;
			action?: string | URL;
			enctype?: string;
			method?: 'post' | 'get' | 'dialog';
			novalidate?: boolean;
			target?: '_self' | '_blank' | '_parent' | '_top';
		}>;
		h1: Props<{}>;
		h2: Props<{}>;
		h3: Props<{}>;
		h4: Props<{}>;
		h5: Props<{}>;
		h6: Props<{}>;
		head: Props<{}>;
		header: Props<{}>;
		hgroup: Props<{}>;
		hr: VoidProps<{}>;
		html: Props<{ xmlns?: string }>;
		i: Props<{}>;
		iframe: Props<{
			allow?: string;
			height?: number;
			width?: number;
			loading?: 'eager' | 'lazy';
			name?: string;
			sandbox?: string;
			src?: string | URL;
			srcdoc?: string | URL;
		}>;
		img: VoidProps<{
			alt?: string;
			crossorigin?: 'anonymous' | 'use-credentials';
			decoding?: 'sync' | 'async' | 'auto';
			elementtiming?: string;
			fetchpriority?: 'high' | 'low' | 'auto';
			height?: number;
			width?: number;
			ismap?: boolean;
			loading?: 'eager' | 'lazy';
			sizes?: string;
			src?: string | URL;
			srcset?: string;
			usemap?: string;
		}>;
		input: VoidProps<{
			type?:
				| 'button'
				| 'checkbox'
				| 'color'
				| 'date'
				| 'datetime-local'
				| 'email'
				| 'file'
				| 'hidden'
				| 'image'
				| 'month'
				| 'number'
				| 'password'
				| 'radio'
				| 'range'
				| 'reset'
				| 'search'
				| 'submit'
				| 'tel'
				| 'text'
				| 'time'
				| 'url'
				| 'week';
			accept?: string;
			alt?: string;
			autocomplete?: boolean;
			capture?: string;
			checked?: boolean;
			dirname?: string;
			disabled?: boolean;
			form?: string;
			formaction?: string | URL;
			formenctype?: string;
			formmethod?: 'post' | 'get';
			formtarget?: string;
			height?: number;
			width?: number;
			list?: string;
			max?: number;
			maxlength?: number;
			min?: number;
			minlength?: number;
			multiple?: boolean;
			name?: string;
			pattern?: string;
			placeholder?: string;
			readonly?: boolean;
			required?: boolean;
			size?: string;
			src?: string | URL;
			step?: number;
			value?: string | number;
		}>;
		ins: Props<{ cite?: string | URL; datetime?: string | Date }>;
		kbd: Props<{}>;
		label: Props<{ for?: string; form?: string }>;
		legend: Props<{}>;
		li: Props<{ value?: number }>;
		link: VoidProps<{
			as?:
				| 'audio'
				| 'document'
				| 'embed'
				| 'fetch'
				| 'font'
				| 'image'
				| 'object'
				| 'script'
				| 'style'
				| 'track'
				| 'video'
				| 'worker';
			blocking?: 'render';
			crossorigin?: boolean | 'anonymous' | 'use-credentials';
			disabled?: boolean;
			fetchpriority?: 'high' | 'low' | 'auto';
			href?: string | URL;
			hreflang?: string;
			imagesizes?: string;
			imagesrcset?: string;
			integrity?: string;
			media?: string;
			rel?:
				| 'alternate'
				| 'author'
				| 'bookmark'
				| 'canonical'
				| 'dns-prefetch'
				| 'help'
				| 'icon'
				| 'license'
				| 'manifest'
				| 'me'
				| 'modulepreload'
				| 'next'
				| 'nofollow'
				| 'pingback'
				| 'preconnect'
				| 'prefetch'
				| 'preload'
				| 'prerender'
				| 'prev'
				| 'search'
				| 'stylesheet'
				| (string & {});
			size?: string;
		}>;
		main: Props<{}>;
		map: Props<{ name?: string }>;
		mark: Props<{}>;
		menu: Props<{}>;
		meta: VoidProps<{
			charset?: 'utf-8' | 'UTF-8';
			content?: string;
			name?:
				| 'application-name'
				| 'author'
				| 'description'
				| 'generator'
				| 'keywords'
				| 'referrer'
				| 'theme-color'
				| 'viewport'
				| 'creator'
				| 'publisher'
				| (string & {});
		}>;
		meter: Props<{
			value?: number;
			min?: number;
			max?: number;
			low?: number;
			high?: number;
			optimum?: number;
			form?: string;
		}>;
		nav: Props<{}>;
		noscript: Props<{}>;
		object: Props<{
			data?: string | URL;
			form?: string;
			height?: number;
			width?: number;
			name?: string;
			type?: string;
			usemap?: string;
		}>;
		ol: Props<{
			reversed?: boolean;
			start?: number;
			type?: 'a' | 'A' | 'i' | 'I' | '1';
		}>;
		optgroup: Props<{ disabled?: boolean; label?: string }>;
		option: Props<{
			disabled?: boolean;
			label?: string;
			selected?: boolean;
			value?: string | number;
		}>;
		output: Props<{ for?: string; form?: string; name?: string }>;
		p: Props<{}>;
		picture: Props<{}>;
		pre: Props<{}>;
		progress: Props<{ max?: number; value?: number }>;
		q: Props<{ cite?: string | URL }>;
		rp: Props<{}>;
		rt: Props<{}>;
		ruby: Props<{}>;
		s: Props<{}>;
		samp: Props<{}>;
		script: Props<{
			async?: boolean;
			defer?: boolean;
			fetchpriority?: 'high' | 'low' | 'auto';
			integrity?: string;
			nomodule?: boolean;
			nonce?: string;
			src?: string | URL;
			type?: '' | 'module' | 'importmap' | (string & {});
			blocking?: 'render';
			children?: string;
		}>;
		search: Props<{}>;
		section: Props<{}>;
		select: Props<{
			autocomplete?: string;
			autofocus?: boolean;
			disabled?: boolean;
			form?: string;
			multiple?: boolean;
			name?: string;
			required?: boolean;
			size?: number;
		}>;
		slot: Props<{ name?: string }>;
		small: Props<{}>;
		source: VoidProps<{
			type?: string;
			src?: string | URL;
			srcset?: string;
			sizes?: string;
			media?: string;
			height?: number;
			width?: number;
		}>;
		span: Props<{}>;
		strong: Props<{}>;
		style: Props<{
			blocking?: 'render';
			media?: string;
			nonce?: string;
			title?: string;
			children?: string;
		}>;
		sub: Props<{}>;
		summary: Props<{}>;
		sup: Props<{}>;
		table: Props<{}>;
		tbody: Props<{}>;
		td: Props<{ colspan?: number; headers?: string; rowspan?: number }>;
		template: Props<{}>;
		textarea: Props<{
			autocapitalize?: boolean;
			autocomplete?: 'on' | 'off';
			autofocus?: boolean;
			cols?: number;
			rows?: number;
			dirname?: string;
			disabled?: boolean;
			form?: string;
			maxlength?: number;
			minlength?: number;
			name?: string;
			placeholder?: string;
			readonly?: boolean;
			required?: boolean;
			spellcheck?: 'true' | 'default' | 'false' | boolean | (string & {});
			wrap?: 'hard' | 'soft' | (string & {});
		}>;
		tfoot: Props<{}>;
		th: Props<{
			abbr?: string;
			colspan?: number;
			rowspan?: number;
			headers?: string;
			scope?: 'row' | 'col' | 'rowgroup' | 'colgroup' | (string & {});
		}>;
		thead: Props<{}>;
		time: Props<{ datetime?: string | Date }>;
		title: Props<{ children?: string }>;
		tr: Props<{}>;
		track: VoidProps<{
			default?: string;
			kind?: 'subtitles' | 'captions' | 'chapters' | 'metadata';
			label?: string;
			src?: string | URL;
			srclang?: string;
		}>;
		u: Props<{}>;
		ul: Props<{}>;
		var: Props<{}>;
		video: Props<{
			autoplay?: boolean;
			controls?: boolean;
			controlslist?:
				| 'nodownload'
				| 'nofullscreen'
				| 'noremoteplayback'
				| (string & {});
			crossorigin?: 'anonymous' | 'use-credentials';
			disablepictureinpicture?: boolean;
			disableremoteplayback?: boolean;
			height?: number;
			width?: number;
			loop?: boolean;
			muted?: boolean;
			playsinline?: boolean;
			poster?: string | URL;
			preload?: 'none' | 'metadata' | 'auto' | '' | (string & {});
			src?: string | URL;
		}>;
		wbr: VoidProps<{}>;
		[name: string]: Props<{}>;
	}
}
