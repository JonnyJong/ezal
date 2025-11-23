import type {
	Article,
	Category,
	Page,
	SiteConfig,
	Tag,
	VirtualPage,
} from 'ezal';
import type { Context as MarkdownContext } from 'ezal-markdown';
import type mime from 'mime-types';
import type { ThemeConfig } from '../src/config';
import type { ImageInfo } from '../src/image';

export interface HomePageData {
	index: number;
	getPages(): HomePage[];
	getArticles(index: number): Article[];
}
export type HomePage = VirtualPage & { data: HomePageData };

export interface ArchivePageData {
	years: Map<number, number>;
	getArticles(year: number): Article[];
}
export type ArchivePage = VirtualPage & { data: ArchivePageData };

export interface CategoryPageData {
	category: Category;
}
export type CategoryPage = VirtualPage & { data: CategoryPageData };

export interface TagPageData {
	tag: Tag;
}
export type TagPage = VirtualPage & { data: TagPageData };

export interface Context {
	site: SiteConfig;
	theme: ThemeConfig;
	page?:
		| (Page & { renderedData: MarkdownContext })
		| (Article & { renderedData: MarkdownContext })
		| HomePage
		| ArchivePage
		| CategoryPage
		| TagPage;
	getImageInfo(url: string): ImageInfo | null;
	mime: typeof mime;
	compareByDate(a: Article, b: Article): number;
}

declare global {
	const context: Context;
}
