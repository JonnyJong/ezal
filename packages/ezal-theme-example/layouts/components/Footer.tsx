import { Time } from 'ezal';
import Contact from './Contact';

const since = context.theme.since;
const now = Time.now();
const author = context.site.author;

export default () => (
	<footer>
		<div class="wrap">
			<Contact />
			<br />
			{'小站运行了'}
			<time id="since" datetime={since?.toString({ timeZoneName: 'never' })}>
				好多好多
			</time>
			{'天'}
			<br />
			{'上次更新于 '}
			<time
				id="last"
				datetime={now.toString({ timeZoneName: 'never' })}
			>{`${now.year} 年 ${now.year} 月 ${now.month} 日`}</time>
			<br />
			{'基于 '}
			<a href="https://github.com/JonnyJong/ezal">Ezal</a>
			{' 博客框架 | '}
			<a href="https://github.com/JonnyJong/ezal/tree/main/packages/ezal-theme-example">
				ezal-theme-example
			</a>
			{' 主题'}
			<br />
			{`©${since ? `${since.year}~` : ''}`}
			<time id="now"></time>
			{` By ${author}`}
			<br />
			{'若无特别说明，所有文章均采用 '}
			<a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">
				CC-BY-NC-SA 4.0
			</a>
			{' 许可协议'}
		</div>
	</footer>
);
