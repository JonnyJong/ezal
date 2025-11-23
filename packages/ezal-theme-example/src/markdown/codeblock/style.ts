import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { Cache, VirtualAssets } from 'ezal';
import stylus from 'stylus';

const base = path.join(__dirname, '../assets/styles/_code.styl');

class CodeblockStyle extends VirtualAssets {
	#baseCache = new Cache<string>();
	extra = '';
	constructor() {
		super('/styles/code.css');
		super.updateDependencies([base]);
	}
	async build() {
		let cache = this.#baseCache.get();
		if (!cache) {
			const file = await readFile(base, 'utf8');
			cache = stylus.render(file);
			this.#baseCache.set(cache);
		}
		return this.extra + cache;
	}
	protected onDependenciesChanged() {
		super.invalidated();
		this.#baseCache.clean();
	}
}

let asset: CodeblockStyle;
export function updateStyles(css: string) {
	if (css === asset.extra) return;
	asset.extra = css;
	asset.invalidated();
}

export function initCodeblockStyle() {
	asset = new CodeblockStyle();
}
