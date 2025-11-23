import { type Page, URL } from 'ezal';
import base from './base';

const page = context.page as Page;

const groups: JSX.Element[] = [];

function shuffle<T>(array: T[]): T[] {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.trunc(Math.random() * (i + 1));
		if (i === j) continue;
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

for (const group of context.theme.links ?? []) {
	const links: JSX.Element[] = [];
	for (const item of group.items) {
		links.push(
			<a
				class="rounded link"
				href={URL.for(item.link)}
				style={{ $theme: item.color }}
			>
				<img class="rounded loaded" src={URL.for(item.avatar)} alt={item.name} />
				<div class="link-title">{item.name}</div>
				<div>{item.description}</div>
			</a>,
		);
	}
	groups.push(
		<hgroup>
			<h2>{group.title}</h2>
			<p>{group.description}</p>
		</hgroup>,
		<div class="links">{shuffle(links)}</div>,
	);
}

export default base(
	<header>
		<div class="wrap">
			<h1>{page.title}</h1>
		</div>
	</header>,
	<main>
		<article>
			<RawHTML html={page.content}></RawHTML>
			{groups}
		</article>
	</main>,
);
