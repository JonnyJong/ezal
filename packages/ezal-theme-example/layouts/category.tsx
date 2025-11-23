import base from './base';
import ArchiveArticleList from './components/ArchiveArticleList';
import type { CategoryPage } from './context';

const page = context.page as CategoryPage;

export default base(
	<header>
		<div class="wrap">
			<h1>{page.title}</h1>
		</div>
	</header>,
	<main>
		<ArchiveArticleList
			articles={page.data.category.getArticles().sort(context.compareByDate)}
		/>
	</main>,
);
