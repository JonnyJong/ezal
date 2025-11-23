import base from './base';
import ArchiveArticleList from './components/ArchiveArticleList';
import type { TagPage } from './context';

const page = context.page as TagPage;

export default base(
	<header>
		<div class="wrap">
			<h1>{page.title}</h1>
		</div>
	</header>,
	<main>
		<ArchiveArticleList
			articles={page.data.tag.getArticles().sort(context.compareByDate)}
		/>
	</main>,
);
