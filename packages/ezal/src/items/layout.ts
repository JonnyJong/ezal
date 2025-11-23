import path from 'node:path';
import { getConfig } from '../config';
import type { PromiseOr } from '../types';
import { Cache } from '../utils/cache';
import fs from '../utils/fs';
import { compareByAscii } from '../utils/object';
import { type DependencyUpdateInfo, Dependent } from './dependent';

//#region Define

/** 布局渲染上下文 */
export interface LayoutContext {
	[name: string]: any;
}

/** 布局渲染器 */
export type LayoutRenderer = (
	context: LayoutContext,
) => PromiseOr<string | Error>;

export interface LayoutCompiled {
	/** 布局渲染器 */
	renderer: LayoutRenderer;
	/** 布局模版依赖 */
	dependencies?: string[];
}

/** 布局编译器 */
export type LayoutCompiler = (src: string) => PromiseOr<LayoutCompiled | Error>;

export interface LayoutConfig {
	/** 布局根绝对路径 */
	root: string;
	/** 布局编译器 */
	compiler: LayoutCompiler;
}

//#region Main

const layouts = new Map<string, Layout>();

async function toFilepath(name: string): Promise<string | null> {
	const filepath = path.join(getConfig().theme.layout.root, name);
	if (await fs.isFile(filepath)) return filepath;
	const dir = path.join(filepath, '..');
	const result = await fs.readDir(dir, 'file');
	if (result instanceof Error) return null;
	const alternatives = result
		.filter((file) => file !== name && path.parse(file).name === name)
		.sort(compareByAscii);
	if (alternatives.length === 0) return null;
	return path.join(dir, alternatives[0]);
}

export class Layout extends Dependent {
	/** 获取模版 */
	static async get(name: string): Promise<Layout | null> {
		const filepath = await toFilepath(name);
		if (!filepath) return null;
		let layout = layouts.get(filepath);
		if (layout) return layout;
		layout = new Layout(filepath);
		layouts.set(filepath, layout);
		return layout;
	}
	#filepath: string;
	#renderer = new Cache<LayoutRenderer>();
	protected constructor(filepath: string) {
		super();
		this.#filepath = filepath;
		this.updateDependencies([this.#filepath]);
	}
	/** 获取渲染器 */
	async getRenderer(): Promise<LayoutRenderer | Error> {
		const cache = this.#renderer.get();
		if (cache) return cache;
		const compiled = await getConfig().theme.layout.compiler(this.#filepath);
		if (compiled instanceof Error) return compiled;
		if (compiled.dependencies) this.updateDependencies(compiled.dependencies);
		this.#renderer.set(compiled.renderer);
		return compiled.renderer;
	}
	protected onDependenciesChanged(updates: DependencyUpdateInfo[]) {
		const removed = updates.find(
			([path, type]) => type === 'rm' && path === this.#filepath,
		);
		if (removed) {
			layouts.delete(this.#filepath);
			return;
		}
		this.#renderer.clean();
		this.updateDependencies([this.#filepath]);
	}
}
