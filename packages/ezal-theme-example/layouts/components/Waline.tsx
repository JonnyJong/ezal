import { Article, Page } from 'ezal';

export default () => {
	const { page, theme } = context;

	if (!theme.waline) return;
	if (!(page instanceof Page)) return;
	if (page instanceof Article) {
		if (page.data?.comment === false) return;
	} else if (!page.data?.comment) return;

	const options = { ...theme.waline, el: '#waline', path: page.url };

	const module =
		theme.cdn?.walineJS ?? 'https://unpkg.com/@waline/client@v3/dist/waline.js';
	const script = `import{init}from'${module}';init(${JSON.stringify(options)})`;

	return <Container>
		<div id="waline" class="wrap"></div>
		<script type="module" defer><RawHTML html={script}/></script>
	</Container>;
};
