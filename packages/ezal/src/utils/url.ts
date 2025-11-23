import { getConfig } from '../config';

const PATTERN_PROTOCOL = /^[a-z]+:/;

/** 标准化链接 */
function normalize(url: string): string {
	url = url.replaceAll('\\', '/');
	const pieces: string[] = [];
	for (const piece of url.split('/')) {
		if (!piece) continue;
		if (piece === '.') {
			if (pieces.length === 0) pieces.push('.');
			else continue;
		}
		if (piece === '..') {
			if (pieces.length === 0 || pieces.at(-1) === '..') pieces.push('..');
			else if (pieces[0] === '.') pieces[0] = '..';
			else pieces.pop();
			continue;
		}
		pieces.push(piece);
	}
	if (pieces.length === 0) return '/';
	let result = pieces.join('/');
	if (result[0] !== '.') result = `/${result}`;
	if (url.at(-1) === '/') result += '/';
	return result;
}

/**
 * 将链接转换为路径
 * @description
 * 移除协议、域名、搜索参数、哈希
 */
function clean(url: string) {
	const protocol = url.match(PATTERN_PROTOCOL);
	if (protocol) url = url.slice(protocol[0].length);
	if (url.startsWith('//')) {
		const i = url.indexOf('/', 2);
		if (i === -1) return '/';
		url = url.slice(i);
	}
	let searchIndex = url.indexOf('?');
	let hashIndex = url.indexOf('#');
	if (searchIndex === -1) searchIndex = Infinity;
	if (hashIndex === -1) hashIndex = Infinity;
	const index = Math.min(searchIndex, hashIndex);
	if (index !== Infinity) url = url.slice(0, index);
	return normalize(url);
}

/**
 * 获取链接后缀
 * @returns 返回链接后缀
 */
function extname(url: string): string;
/**
 * 替换后缀
 * @returns 返回新链接
 */
function extname(url: string, ext: string): string;
function extname(url: string, ext?: string): string {
	const parts = url.split('/');
	let last = parts.pop()!;
	const index = last.lastIndexOf('.');
	if (ext === undefined) {
		if (index === -1) return '';
		return last.slice(index);
	}
	if (index === -1) last += ext;
	else last = last.slice(0, index) + ext;
	parts.push(last);
	return parts.join('/');
}

/** 拼接链接 */
function join(...urls: string[]): string {
	let start = 0;
	for (const [i, url] of urls.entries()) {
		if (PATTERN_PROTOCOL.test(url)) start = i;
		else if (url.startsWith('//')) start = i;
	}
	urls = urls.slice(start);
	let head = '';
	const protocol = urls[0].match(PATTERN_PROTOCOL);
	if (protocol) {
		urls[0] = urls[0].slice(protocol[0].length);
		head += protocol[0];
	}
	if (urls[0].startsWith('//')) {
		urls[0] = urls[0].slice(2);
		head += '//';
	}
	return head + normalize(urls.join('/'));
}

/** 解码 */
function decode(url: string): string {
	return decodeURIComponent(url);
}

/** 编码 */
function encode(url: string): string {
	const protocol = url.match(PATTERN_PROTOCOL);
	if (protocol) url = url.slice(protocol[0].length);
	let result = url.split('/').map(encodeURIComponent).join('/');
	if (protocol) result = protocol[0] + result;
	return result;
}

/** 解析链接 */
function resolve(from: string, to: string) {
	if (to.startsWith('/')) return normalize(to);
	return join(from, to);
}

/**
 * 根据站点根路径生成完整链接
 * @description
 * - 带主机名链接、相对链接：原样返回
 * - 无主机名链接：添加根路径前缀
 */
function _for(...urls: string[]) {
	const url = join(...urls);
	if (PATTERN_PROTOCOL.test(url)) return url;
	if (url.startsWith('//')) return url;
	if (url[0] === '.') return url;
	return join(getConfig().site.root ?? '/', url);
}

/**
 * 构建完整站点 URL
 * @description
 * - 带主机名链接、相对链接：原样返回
 * - 无主机名链接：添加根路径前缀
 */
function full(...urls: string[]) {
	const url = join(...urls);
	if (PATTERN_PROTOCOL.test(url)) return url;
	if (url.startsWith('//')) return url;
	if (url[0] === '.') return url;
	const { root, domain } = getConfig().site;
	return domain + join(root ?? '/', url);
}

export const URL = {
	normalize,
	clean,
	extname,
	join,
	decode,
	encode,
	resolve,
	for: _for,
	full,
};
