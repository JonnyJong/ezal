import { Time } from './utils/time';

const COLOR = {
	DEBUG: '\x1b[90m',
	INFO: '\x1b[32m',
	WARN: '\x1b[33m',
	ERROR: '\x1b[91m',
	FATAL: '\x1b[31m',
	NONE: '\x1b[0m',
	TIME: '\x1b[90m',
} as const;

function time(): string {
	const date = Time.now();
	return (
		COLOR.TIME +
		date.hour.toString().padStart(2, '0') +
		':' +
		date.minute.toString().padStart(2, '0') +
		':' +
		date.second.toString().padStart(2, '0') +
		'.' +
		date.millisecond.toString().padStart(3, '0') +
		COLOR.NONE
	);
}

const timingMap = new WeakMap<WeakKey, number>();

export class Logger {
	static #verbose = false;
	static get verbose() {
		return Logger.#verbose;
	}
	static set verbose(value) {
		Logger.#verbose = !!value;
	}
	#mod: string;
	constructor(mod: string) {
		this.#mod = String(mod);
	}
	debug(...messages: any[]): void {
		if (!Logger.#verbose) return;
		console.debug(time(), COLOR.DEBUG + this.#mod + COLOR.NONE, ...messages);
	}
	log(...messages: any[]): void {
		console.log(time(), COLOR.INFO + this.#mod + COLOR.NONE, ...messages);
	}
	warn(...messages: any[]): void {
		console.warn(time(), COLOR.WARN + this.#mod + COLOR.NONE, ...messages);
	}
	error(...messages: any[]): void {
		console.error(time(), COLOR.ERROR + this.#mod + COLOR.NONE, ...messages);
	}
	fatal(...messages: any[]): never {
		console.error(time(), COLOR.ERROR + this.#mod + COLOR.NONE, ...messages);
		process.exit(1);
	}
	timeStart(key: WeakKey): void {
		timingMap.set(key, Date.now());
	}
	timeEnd(key: WeakKey, maxTime: number, ...messages: any[]): void {
		const startTime = timingMap.get(key);
		if (!startTime) return;
		const elapsed = Date.now() - startTime;
		if (elapsed <= maxTime) return;
		this.warn(
			`Slow operation: expected <${maxTime}ms, took ${elapsed}ms`,
			...messages,
		);
	}
}
