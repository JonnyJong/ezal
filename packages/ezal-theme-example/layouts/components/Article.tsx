import { type Article, URL } from 'ezal';
import Image from './Image';

export default ({ article }: { article: Article }): JSX.Element => (
	<a class="article rounded" href={URL.for(article.url)}>
		{article.data?.cover
			? [
					<Image
						class="bloom"
						url={URL.for(URL.resolve(article.url, article.data.cover))}
						alt={article.title}
					/>,
					<Image
						url={URL.for(URL.resolve(article.url, article.data.cover))}
						alt={article.title}
					/>,
				]
			: null}
		<div class="article-info">
			<object>
				{...article.categories
					.values()
					.map((category) => (
						<a class="link" href={URL.for('category', ...category.path)}>
							{category.path.join('/')}
						</a>
					))
					.toArray()}
			</object>
			<h2>{article.title}</h2>
			<object>
				{article.tags
					.values()
					.map((tag) => (
						<a class="tag link" href={URL.for(`/tag/${tag.name}/`)}>
							{tag.name}
						</a>
					))
					.toArray()}
				<time datetime={article.date.toString({ timeZoneName: 'never' })}>
					{article.date.toPlainDate().toString()}
				</time>
			</object>
		</div>
	</a>
);
