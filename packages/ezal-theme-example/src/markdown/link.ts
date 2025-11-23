import { URL } from 'ezal';
import { type ASTPlugin, LinkNode, utils } from 'ezal-markdown';

const PATTERN_ABSOLUTE_LINK = /^[a-z][a-z0-9+.-]*:|^\/\//;

const { $ } = utils;

export const link: ASTPlugin<'inline', LinkNode> = {
	name: 'link',
	type: 'inline',
	phase: 'post',
	priority: 1,
	parse() {},
	verifyNode(node): node is LinkNode {
		return node instanceof LinkNode;
	},
	render(node) {
		const html = [...node.entires().map((node) => node.html)];
		const target = PATTERN_ABSOLUTE_LINK.test(node.destination)
			? '_blank'
			: undefined;
		return $('a', {
			attr: { href: URL.for(node.destination), target, title: node.title },
			html,
		});
	},
};
