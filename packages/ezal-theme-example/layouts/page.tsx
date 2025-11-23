import type { Page } from 'ezal';
import base from './base';
import Image from './components/Image';

const page = context.page as Page;

export default base(
	<header>
		{page.data.cover ? <Image url={page.data.cover} alt={page.title} /> : null}
		<div class="wrap">
			<h1>{page.title}</h1>
		</div>
	</header>,
	<main>
		<article>
			<RawHTML html={page.content} />
		</article>
	</main>,
);
