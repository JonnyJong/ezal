import { Tag, VirtualPage } from 'ezal';
import type { TagPage, TagPageData } from '../../layouts/context';

const tags = new Map<Tag, TagPage>();

function createPage(tag: Tag): TagPage {
	const id = `tag/${tag.name}`;
	const data: TagPageData = { tag };
	return new VirtualPage({
		id,
		src: `/${id}/`,
		title: `标签：${tag.name}`,
		layout: 'tag',
		data,
	}) as TagPage;
}

let scanned = false;
export function updateTagPage(_any?: any) {
	if (!scanned && _any) return;
	scanned = true;
	for (const [tag, page] of tags.entries().toArray()) {
		if (!tag.destroyed) continue;
		page.destroy();
		tags.delete(tag);
	}
	for (const tag of Tag.getAll()) {
		if (tags.has(tag)) continue;
		tags.set(tag, createPage(tag));
	}
}
