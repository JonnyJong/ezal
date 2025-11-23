import { type Dirent, existsSync, type Stats } from 'node:fs';
import FS from 'node:fs/promises';
import path from 'node:path';
import { Readable } from 'node:stream';
import { dryRun } from '../config';
import { normalizeError } from './error';
import { Queue } from './queue';

const ERR = {
	TRAVERSE_ABSOLUTE: (root: string) =>
		`Traversing a directory requires an absolute path, but received "${root}"`,
	TRAVERSE_DIR: (root: string) =>
		`The path "${root}" to be traversed does not exist or is not a directory`,
	NOT_DIR: (path: string) => `"${path}" is not a directory or does not exist`,
} as const;

/** 检查路径是否存在 */
export function exists(path: string): boolean {
	return existsSync(path);
}

/** 读取文件状态信息 */
export async function stat(path: string): Promise<Stats | Error> {
	try {
		return await FS.stat(path);
	} catch (error) {
		return normalizeError(error);
	}
}

/** 检查是否为文件 */
export async function isFile(path: string): Promise<boolean> {
	if (!exists(path)) return false;
	const stats = await stat(path);
	if (stats instanceof Error) return false;
	return stats.isFile();
}

/** 检查是否为目录 */
export async function isDir(path: string): Promise<boolean> {
	if (!exists(path)) return false;
	const stats = await stat(path);
	if (stats instanceof Error) return false;
	return stats.isDirectory();
}

/** 读取目录 */
export async function readDir(
	path: string,
	type: 'file',
): Promise<string[] | Error>;
export async function readDir(
	path: string,
	type: 'dir',
): Promise<string[] | Error>;
export async function readDir(
	path: string,
	type: 'dirent',
): Promise<Dirent[] | Error>;
export async function readDir(
	path: string,
	type: 'file' | 'dir' | 'dirent',
): Promise<Dirent[] | string[] | Error> {
	if (!(await isDir(path))) return new Error(ERR.NOT_DIR(path));
	try {
		const result = await FS.readdir(path, { withFileTypes: true });
		if (type === 'dirent') return result;
		if (type === 'file') {
			return result
				.filter((dirent) => dirent.isFile())
				.map((dirent) => dirent.name);
		}
		return result
			.filter((dirent) => dirent.isDirectory())
			.map((dirent) => dirent.name);
	} catch (error) {
		return normalizeError(error);
	}
}

/** 读取文件 */
export async function readFile(path: string): Promise<string | Error> {
	let file: FS.FileHandle | undefined;
	try {
		file = await FS.open(path, 'r');
		return await file.readFile('utf8');
	} catch (error) {
		return normalizeError(error);
	} finally {
		await file?.close();
	}
}

/**
 * 创建目录
 * @returns
 * - `true`：创建成功
 * - `false`：路径存在目录，无需创建
 * - `Error`：创建目录时出现错误
 */
export async function mkdir(path: string): Promise<Error | boolean> {
	try {
		if (exists(path)) {
			const stat = await FS.stat(path);
			if (stat.isDirectory()) return false;
			return new Error(
				`The path "${path}" already exists and is not a directory, cannot create directory.`,
			);
		}
		await FS.mkdir(path, { recursive: true });
		return true;
	} catch (error) {
		return normalizeError(error);
	}
}

/** 写入文件 */
export async function writeFile(
	filepath: string,
	data: string | Buffer | Readable,
): Promise<Error | null> {
	if (dryRun()) {
		if (!(data instanceof Readable)) return null;
		return new Promise((resolve) => {
			data
				.on('data', () => {})
				.on('end', () => resolve(null))
				.on('error', (error) => resolve(normalizeError(error)));
		});
	}
	const dir = path.join(filepath, '..');
	const error = await mkdir(dir);
	if (error instanceof Error) return error;
	let file: FS.FileHandle | undefined;
	try {
		file = await FS.open(filepath, 'w');
		if (typeof data === 'string') {
			await file.writeFile(data, 'utf8');
		} else if (data instanceof Readable) {
			await new Promise<void>((resolve, reject) => {
				data
					.pipe(file!.createWriteStream())
					.on('finish', resolve)
					.on('error', reject);
			});
		} else {
			await file.writeFile(data);
		}
		return null;
	} catch (error) {
		return normalizeError(error);
	} finally {
		await file?.close();
	}
}

/**
 * 移除路径
 * @returns
 * - `true`：移除成功
 * - `false`：路径不存在，无需移除
 * - `Error`：移除时出现错误
 */
export async function remove(path: string): Promise<Error | boolean> {
	if (!exists(path)) return false;
	try {
		const stat = await FS.stat(path);
		await FS.rm(path, {
			recursive: stat.isDirectory() && !stat.isSymbolicLink(),
		});
		return true;
	} catch (error) {
		return normalizeError(error);
	}
}

export async function* traverseDir(root: string): AsyncGenerator<string> {
	if (!path.isAbsolute(root)) throw new Error(ERR.TRAVERSE_ABSOLUTE(root));
	if (!(await isDir(root))) throw new Error(ERR.TRAVERSE_DIR(root));
	const queue = new Queue<string>();
	queue.enqueue('.');
	for (const current of queue) {
		const dir = path.join(root, current);
		for (const dirent of await FS.readdir(dir, { withFileTypes: true })) {
			if (['_', '.'].includes(dirent.name[0])) continue;
			const target = path.join(current, dirent.name);
			if (dirent.isDirectory()) queue.enqueue(target);
			if (dirent.isFile()) yield target;
		}
	}
}

const fs = {
	exists,
	stat,
	isFile,
	isDir,
	readDir,
	readFile,
	mkdir,
	writeFile,
	remove,
};

export default fs;
