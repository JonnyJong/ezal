import { type Article, URL } from 'ezal';

export default ({ articles }: { articles: Article[] }) => (
	<ul class="archive">
		{articles.map((article) => (
			<li>
				<time datetime={article.date.toString({ timeZoneName: 'never' })}>
					{article.date.toPlainDate().toString()}
				</time>
				<a href={URL.for(article.url)}>{article.title}</a>
			</li>
		))}
	</ul>
);
