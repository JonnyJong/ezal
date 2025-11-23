import { URL } from 'ezal';

const { site, theme } = context;

export default () => (
	<nav>
		<a class="site link" href={URL.for('/')}>
			{site.title}
		</a>
		<div class="flex"></div>
		<ul class="nav">
			{theme.nav?.map(({ name, link }) => (
				<li>
					<a class="link" href={URL.for(link)}>
						{name}
					</a>
				</li>
			))}
		</ul>
		<button
			class="icon-search link"
			id="search"
			title="搜索"
			type="button"
		></button>
		<button
			class="icon-nav link"
			id="nav"
			title="导航菜单"
			type="button"
		></button>
	</nav>
);
