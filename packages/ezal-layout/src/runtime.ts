export class Node {
	#name: string;
	#attr: Record<string, any> = {};
	#parent: Node | null = null;
	#children: (Node | string)[] = [];
	constructor(name: string) {
		this.#name = name;
	}
	/** 节点名称 */
	get name() {
		return this.#name;
	}
	/** 节点属性 */
	get attr() {
		return this.#attr;
	}
	set attr(value) {
		if (!value || typeof value !== 'object') return;
		this.#attr = value;
	}
	/** 父节点 */
	get parent() {
		return this.#parent;
	}
	/** 子节点 */
	get children() {
		return [...this.#children];
	}
	get childrenCount() {
		return this.#children.length;
	}
	*entires(): Generator<string | Node> {
		for (const child of this.#children) {
			yield child;
		}
	}
	/**
	 * 获取索引对应的子节点
	 * @description
	 * 允许正数和负数索引，负数从节点列表的最后一个元素开始倒数
	 */
	child(index: number): Node | string | null {
		return this.#children.at(index) ?? null;
	}
	/**
	 * 获取当前节点在父节点的子节点列表中的索引值
	 * @description
	 * 若当前节点无父节点，返回 -1
	 */
	getIndex(): number {
		if (!this.#parent) return -1;
		return this.#parent.#children.indexOf(this);
	}
	/** 检查 node 是否为当前节点或当前节点的后代节点 */
	contains(node: Node): boolean {
		if (!(node instanceof Node)) return false;
		if (node === this) return true;

		const stack: Node[] = [this];

		while (true) {
			const current = stack.pop();
			if (!current) return false;
			for (const child of current.#children) {
				if (child === node) return true;
				if (typeof child === 'string') continue;
				if (child.#children.length === 0) continue;
				stack.push(child);
			}
		}
	}
	/**
	 * 检查待插入节点
	 * @description
	 * 节点数组中若有节点符合以下情况，返回 false
	 * - 不为 Node 类或不为 Node 派生类实例或字符串
	 * - 为当前节点
	 * - 为当前节点的祖先节点
	 */
	#isInsertable(nodes: (Node | string)[]): boolean {
		let current: Node = this;
		const paths: (Node | string)[] = [this];
		while (current.#parent) {
			current = current.#parent;
			paths.push(current);
		}

		for (const node of nodes) {
			if (!(node instanceof Node || typeof node === 'string')) return false;
			if (paths.includes(node)) return false;
		}
		return true;
	}
	/**
	 * 替换当前节点的子节点列表
	 * @returns
	 * 若替换的节点中包含当前节点或当前节点的祖先节点时，
	 * 替换不会执行，并返回 false
	 */
	replace(...nodes: (Node | string)[]): boolean {
		if (!this.#isInsertable(nodes)) return false;
		while (true) {
			const child = this.#children.pop();
			if (!child) break;
			if (typeof child === 'string') continue;
			child.#parent = null;
		}
		for (const node of nodes) {
			if (typeof node === 'string') continue;
			node.remove();
			node.#parent = this;
		}
		this.#children.push(...nodes);
		return true;
	}
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
	insert(index: number, ...nodes: (Node | string)[]): boolean {
		if (!this.#isInsertable(nodes)) return false;
		index = Math.trunc(index);
		if (index > this.#children.length) {
			index = this.#children.length;
		} else if (index < 0) {
			index = this.#children.length + index + 1;
			if (index < 0) index = 0;
		}
		for (const node of nodes) {
			const i = this.#children.indexOf(node);
			if (node instanceof Node) {
				node.remove();
				node.#parent = this;
			}
			if (i === -1 || i >= index) continue;
			index--;
		}
		this.#children.splice(index, 0, ...nodes);
		return true;
	}
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
	before(...nodes: Node[]): boolean {
		if (!this.#parent) return false;
		return this.#parent.insert(this.getIndex(), ...nodes);
	}
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
	prepend(...nodes: Node[]): boolean {
		return this.insert(0, ...nodes);
	}
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
	append(...nodes: Node[]): boolean {
		return this.insert(-1, ...nodes);
	}
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
	after(...nodes: Node[]): boolean {
		if (!this.#parent) return false;
		return this.#parent.insert(this.getIndex() + 1, ...nodes);
	}
	/**
	 * 从父节点的节点列表中移除该节点
	 * @returns 若当前节点无父节点，返回 false
	 */
	remove(): boolean {
		if (!this.#parent) return false;
		this.#parent.#children.splice(this.getIndex(), 1);
		this.#parent = null;
		return true;
	}
	/** 获取上一个相邻的节点 */
	prev(): Node | string | null {
		if (!this.#parent) return null;
		return this.#parent.#children[this.getIndex() - 1] ?? null;
	}
	/** 获取下一个相邻的节点 */
	next(): Node | string | null {
		if (!this.#parent) return null;
		return this.#parent.#children[this.getIndex() + 1] ?? null;
	}
}

export class DocNode extends Node {
	constructor() {
		super('doc');
	}
}

export class RawHTMLNode extends Node {
	#html: string;
	constructor(html: string) {
		super('raw-html');
		this.#html = String(html);
	}
	get html() {
		return this.#html;
	}
	set html(value) {
		this.#html = String(value);
	}
	replace() {
		return false;
	}
	insert() {
		return false;
	}
	before() {
		return false;
	}
	prepend() {
		return false;
	}
	append() {
		return false;
	}
	after() {
		return false;
	}
}

export class ContainerNode extends Node {
	constructor() {
		super('container');
	}
}

export function Doc(attr?: Record<string, any> | null): DocNode {
	const node = new DocNode();
	node.attr = attr ?? {};
	return node;
}
export function RawHTML({ html }: { html: string }): RawHTMLNode {
	return new RawHTMLNode(html);
}
export function Container(attr?: Record<string, any> | null) {
	const node = new DocNode();
	node.attr = attr ?? {};
	return node;
}

export function h(
	name:
		| string
		| typeof Doc
		| typeof RawHTML
		| ((attr?: Record<string, any> | null) => Node),
	attr: Record<string, any> | null,
	...nodes: any[]
): Node | undefined {
	if (name === RawHTML) return RawHTML(attr as any);

	nodes = nodes
		.flat(Infinity)
		.filter((node) => node !== null && node !== undefined)
		.map((node) => (node instanceof Node ? node : String(node)));

	let node: Node;
	if (typeof name === 'function') {
		node = (name as any)(attr ?? undefined);
	} else {
		node = new Node(name);
		node.attr = attr ?? {};
	}

	node?.append(...nodes);
	return node;
}
