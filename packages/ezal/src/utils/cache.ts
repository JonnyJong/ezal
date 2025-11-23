import { PassThrough, Readable } from 'node:stream';
import { getMode } from '../config';
import { Logger } from '../logger';
import type { RouteContent } from '../route';

const INFO = {
	CLEARED: (count: number) => `Cleared ${count} expired cache`,
	USED: (used: string) => `Current memory usage ${used}MiB`,
	EXCEED: (count: number) =>
		`Memory usage exceeds threshold, continuing to clear ${count} cache`,
} as const;

const TIMEOUT = 3 * 60 * 1000; // 3 Minutes
const MEMORY_THRESHOLD = 1024 * 1024 * 512; // 512 MiB
const CLEAN_INTERVAL = 30 * 1000; // 30 Seconds
const KEEP_TIMEOUT = 60 * 1000; // 1 Minutes

const logger = new Logger('cache');

const caches = new Set<WeakRef<Cache<any>>>();

setInterval(() => {
	if (getMode() === 'build') return;
	logger.debug('Starting cache clean...');
	const next = cleanOutdated();
	const used = process.memoryUsage().heapUsed;
	logger.debug(INFO.USED((used / 1024 / 1024).toFixed(2)));
	if (used < MEMORY_THRESHOLD) return;
	logger.debug(INFO.EXCEED(next.length));
	for (const cache of next) {
		cache.clean();
	}
}, CLEAN_INTERVAL);

function cleanOutdated(): Cache<any>[] {
	let count = 0;
	const now = Date.now();
	const timeout = now - TIMEOUT;
	const keepTimeout = now - KEEP_TIMEOUT;
	const next: Cache<any>[] = [];
	for (const ref of caches.values().toArray()) {
		const cache = ref.deref();
		if (!cache) {
			caches.delete(ref);
			continue;
		}
		const time = cache.lastAccessed;
		if (time > keepTimeout) continue;
		if (time < timeout) {
			count++;
			cache.clean();
			continue;
		}
		next.push(cache);
	}
	logger.debug(INFO.CLEARED(count));
	return next;
}

/**
 * 缓存
 * @description
 * 长时间未读取、更新或内存不足时将自动清理
 */
export class Cache<T> {
	#ref = new WeakRef(this);
	constructor() {
		caches.add(this.#ref);
	}
	#cache?: T;
	#lastAccessed = Date.now();
	/** 上次访问时间 */
	get lastAccessed() {
		return this.#cache === undefined ? Infinity : this.#lastAccessed;
	}
	/** 读取缓存 */
	get() {
		this.#lastAccessed = Date.now();
		return this.#cache;
	}
	/** 更新缓存 */
	set(data: T) {
		this.#lastAccessed = Date.now();
		this.#cache = data;
	}
	/** 清理缓存 */
	clean() {
		this.#cache = undefined;
	}
	[Symbol.dispose]() {
		caches.delete(this.#ref);
	}
}

/** 将数据同时写入缓存并输出 */
export function teeToCache(
	cache: Cache<Buffer>,
	data: RouteContent,
): RouteContent {
	if (!(data instanceof Readable)) {
		cache.set(Buffer.from(data));
		return data;
	}
	const cacheStream = new PassThrough();
	const outputStream = new PassThrough();
	const chunks: Buffer[] = [];
	cacheStream.on('data', (chunk: Buffer) => {
		chunks.push(chunk);
		outputStream.write(chunk);
	});
	cacheStream.on('end', () => {
		outputStream.end();
		cache.set(Buffer.concat(chunks));
	});
	cacheStream.on('error', (error) => {
		outputStream.destroy(error);
	});
	data.pipe(cacheStream).on('error', (error) => {
		cacheStream.destroy(error);
	});
	return outputStream;
}
