import { Logger } from '../logger';

export type DependencyChangeType = 'add' | 'rm' | 'update';

export type DependencyUpdateInfo = [
	filepath: string,
	type: DependencyChangeType,
];

const INFO = {
	RESOLVING: 'Resolving dependencies update...',
	EMITTING: 'Emitting dependencies update...',
	MISSING: (src: string) =>
		`Unable to find dependencies related to "${src}", dependency management may be corrupted`,
} as const;

const logger = new Logger('dependent');

const depMap = new Map<string, Set<WeakRef<Dependent>>>();
let updateInfos: DependencyUpdateInfo[] = [];
let emitTimeout: NodeJS.Timeout | null = null;

function resolve(): Map<Dependent, Map<string, DependencyChangeType>> {
	logger.debug(INFO.RESOLVING, updateInfos);
	const dependents = new Map<Dependent, Map<string, DependencyChangeType>>();
	for (const [filepath, type] of updateInfos) {
		const deps = depMap.get(filepath);
		if (!deps) continue;
		for (const ref of deps) {
			const dependent = ref.deref();
			if (!dependent || dependent.destroyed) continue;
			let infos = dependents.get(dependent);
			if (!infos) {
				infos = new Map();
				dependents.set(dependent, infos);
			}
			const oldType = infos.get(filepath);
			if (oldType === 'rm' && type === 'add') {
				infos.set(filepath, 'update');
			} else if (oldType === 'add' && type === 'rm') {
				infos.delete(filepath);
			} else {
				infos.set(filepath, type);
			}
		}
	}
	return dependents;
}

async function report(promises: any[]) {
	const result = await Promise.allSettled(promises);
	for (const item of result) {
		if (item.status === 'fulfilled') continue;
		logger.debug(item.reason);
	}
}

export abstract class Dependent {
	static emit(...updates: DependencyUpdateInfo[]) {
		updateInfos.push(...updates);
		if (emitTimeout !== null) clearTimeout(emitTimeout);
		emitTimeout = setTimeout(() => {
			emitTimeout = null;
			const dependents = resolve();
			updateInfos = [];
			logger.debug(INFO.EMITTING, dependents);
			const promises = [];
			for (const [dependent, infos] of dependents) {
				promises.push(dependent.onDependenciesChanged(infos.entries().toArray()));
			}
			report(promises);
		}, 10);
	}
	#destroyed = false;
	#ref = new WeakRef(this);
	#dependencies: string[] = [];
	/** 是否被销毁 */
	get destroyed() {
		return this.#destroyed;
	}
	/** 依赖 */
	get dependencies() {
		return [...this.#dependencies];
	}
	/** 销毁 */
	destroy() {
		if (this.#destroyed) return;
		this.#destroyed = true;
		this.updateDependencies([]);
	}
	/** 更新依赖 */
	protected updateDependencies(dependencies: string[]): void {
		const deps = new Set(dependencies);
		// Remove old
		for (const dep of this.#dependencies) {
			if (deps.has(dep)) {
				deps.delete(dep);
				continue;
			}
			const dependents = depMap.get(dep);
			if (!dependents) {
				logger.warn(INFO.MISSING(dep));
				continue;
			}
			dependents.delete(this.#ref);
		}
		// Setup new
		for (const dep of deps) {
			let dependents = depMap.get(dep);
			if (!dependents) {
				dependents = new Set();
				depMap.set(dep, dependents);
			}
			dependents.add(this.#ref);
		}
		this.#dependencies = new Set(dependencies).values().toArray();
	}
	/** 依赖变更回调 */
	protected abstract onDependenciesChanged(updates: DependencyUpdateInfo[]): any;
	[Symbol.dispose]() {
		this.updateDependencies([]);
	}
}
