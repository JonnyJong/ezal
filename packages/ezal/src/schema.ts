import path from 'node:path';
import { Readable } from 'node:stream';
import {
	_function,
	instanceof as _instanceof,
	any,
	array,
	boolean,
	custom,
	number,
	object,
	promise,
	record,
	string,
	union,
	type ZodType,
} from 'zod';
import type {
	EzalConfig,
	ServerConfig,
	SiteConfig,
	SourceConfig,
	ThemeConfig,
} from './config';
import type { HookOptions } from './hooks';
import type { ArticleUrlFormatter } from './items/article';
import type {
	Transformer,
	TransformResult,
	TransformRule,
} from './items/asset';
import type {
	LayoutCompiled,
	LayoutCompiler,
	LayoutConfig,
	LayoutRenderer,
} from './items/layout';
import type {
	PageContent,
	PageHandler,
	PageParser,
	PageRendered,
	PageRenderer,
	PageUrlFormatter,
} from './items/page';
import type { RouteContent } from './route';
import type { ArrayOr, LanguageCode, PromiseOr, TimeZoneId } from './types';
import { LANGUAGE_CODE, TIME_ZONE_ID } from './utils/consts';

export function promiseOr<T>(type: ZodType<T>): ZodType<PromiseOr<T>> {
	return custom<PromiseOr<T>>(async (v) => {
		const resolved = await Promise.resolve(v);
		await type.parseAsync(resolved);
		return true;
	});
}

export function arrayOr<T>(type: ZodType<T>): ZodType<ArrayOr<T>> {
	return union([array(type), type]);
}

export const SCHEMA_LANGUAGE_CODE: ZodType<
	LanguageCode | `${LanguageCode}-${string}`
> = custom<LanguageCode | `${LanguageCode}-${string}`>((val) => {
	if (typeof val !== 'string') return false;
	const prefix = val.split('-', 1)[0];
	return LANGUAGE_CODE.includes(prefix as any);
});

export const SCHEMA_TIME_ZONE_ID: ZodType<TimeZoneId> = custom<TimeZoneId>(
	(val) => {
		if (typeof val !== 'string') return false;
		return TIME_ZONE_ID.includes(val as any);
	},
);

export const SCHEMA_ROUTE_CONTENT: ZodType<RouteContent> = union([
	string(),
	_instanceof(Readable),
	_instanceof(Buffer),
]);

//#region Asset

export const SCHEMA_TRANSFORM_RESULT: ZodType<TransformResult> = object({
	result: SCHEMA_ROUTE_CONTENT,
	dependencies: array(string()).optional(),
});

export const SCHEMA_TRANSFORMER: ZodType<Transformer> = _function({
	input: [string(), string()],
	output: promise(union([SCHEMA_TRANSFORM_RESULT, _instanceof(Error)])),
});

export const SCHEMA_TRANSFORM_RULE: ZodType<TransformRule> = object({
	from: arrayOr(
		string().lowercase().startsWith('.') as ZodType<Lowercase<`.${string}`>>,
	),
	to: string().lowercase().startsWith('.') as ZodType<Lowercase<`.${string}`>>,
	transformer: SCHEMA_TRANSFORMER,
});

//#region Layout

export const SCHEMA_LAYOUT_RENDERER: ZodType<LayoutRenderer> = _function({
	input: [any()],
	output: promise(union([string(), _instanceof(Error)])),
});

export const SCHEMA_LAYOUT_COMPILED: ZodType<LayoutCompiled> = object({
	renderer: SCHEMA_LAYOUT_RENDERER,
	dependencies: array(string()).optional(),
});

export const SCHEMA_LAYOUT_COMPILER: ZodType<LayoutCompiler> = _function({
	input: [string()],
	output: promise(union([SCHEMA_LAYOUT_COMPILED, _instanceof(Error)])),
});

export const SCHEMA_LAYOUT_CONFIG: ZodType<LayoutConfig> = object({
	root: string().refine((val) => path.isAbsolute(val)),
	compiler: SCHEMA_LAYOUT_COMPILER,
});

//#region Page

export const SCHEMA_PAGE_CONTENT: ZodType<PageContent> = object({
	content: string(),
	data: record(string(), any()),
	dependencies: array(string()).optional(),
});

export const SCHEMA_PAGE_PARSER: ZodType<PageParser> = _function({
	input: [string()],
	output: promise(union([SCHEMA_PAGE_CONTENT, _instanceof(Error)])),
});

export const SCHEMA_PAGE_RENDERED: ZodType<PageRendered> = object({
	html: string(),
	data: record(string(), any()),
});

export const SCHEMA_PAGE_RENDERER: ZodType<PageRenderer> = _function({
	input: [string(), any()],
	output: promise(union([SCHEMA_PAGE_RENDERED, _instanceof(Error)])),
});

export const SCHEMA_PAGE_HANDLER: ZodType<PageHandler> = object({
	exts: arrayOr(
		string().lowercase().startsWith('.') as ZodType<Lowercase<`.${string}`>>,
	),
	parser: SCHEMA_PAGE_PARSER,
	renderer: SCHEMA_PAGE_RENDERER,
});

export const SCHEMA_PAGE_URL_FORMATTER: ZodType<PageUrlFormatter> = _function({
	input: [any()],
	output: string(),
});

//#region Article

export const SCHEMA_ARTICLE_URL_FORMATTER: ZodType<ArticleUrlFormatter> =
	_function({
		input: [any()],
		output: string(),
	});

//#region Hook

export const SCHEMA_HOOK_OPTIONS: ZodType<HookOptions> = record(
	string(),
	arrayOr(_function({ input: [any()], output: any() })),
);

//#region Config

export const SCHEMA_THEME_CONFIG: ZodType<ThemeConfig> = object({
	assetsRoot: string().refine(
		(val) => path.isAbsolute(val),
		'The root directory path of the theme resource must be an absolute path',
	),
	transformRules: array(SCHEMA_TRANSFORM_RULE).optional(),
	layout: SCHEMA_LAYOUT_CONFIG,
	pageHandlers: array(SCHEMA_PAGE_HANDLER),
	hooks: SCHEMA_HOOK_OPTIONS.optional(),
});

const PATTERN_DOMAIN =
	/^https:\/\/[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
const PATTERN_URL_ROOT = /^\//;
export const SCHEMA_SITE_CONFIG: ZodType<SiteConfig> = object({
	title: string(),
	description: string().optional(),
	keywords: array(string()).optional(),
	author: string(),
	language: SCHEMA_LANGUAGE_CODE,
	timezone: SCHEMA_TIME_ZONE_ID.optional(),
	domain: string().regex(
		PATTERN_DOMAIN,
	) as ZodType<`https://${string}.${string}`>,
	root: string().regex(PATTERN_URL_ROOT).optional() as ZodType<`/${string}`>,
	pageUrlFormat: SCHEMA_PAGE_URL_FORMATTER.optional(),
	articleUrlFormat: SCHEMA_ARTICLE_URL_FORMATTER.optional(),
});

export const SCHEMA_SOURCE_CONFIG: ZodType<SourceConfig> = object({
	root: string(),
	article: string().refine((v) => !path.isAbsolute(v)),
});

export const SCHEMA_SERVER_CONFIG: ZodType<ServerConfig> = object({
	port: number().int().min(0).max(65535).optional(),
	host: string().optional(),
	autoReload: boolean().optional(),
});

export const SCHEMA_EZAL_CONFIG: ZodType<EzalConfig> = object({
	site: SCHEMA_SITE_CONFIG,
	source: SCHEMA_SOURCE_CONFIG,
	outDir: string(),
	theme: SCHEMA_THEME_CONFIG,
	server: SCHEMA_SERVER_CONFIG.optional(),
});
