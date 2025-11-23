import Footer from './components/Footer';
import Head from './components/Head';
import Nav from './components/Nav';
import Search from './components/Search';
import Waline from './components/Waline';

export default (...elements: JSX.Element[]) => (
	<Doc lang={context.site.language}>
		<head>
			<Head />
		</head>
		<body>
			<Nav />
			{elements}
			<Search />
			<Waline />
			<Footer />
		</body>
	</Doc>
);
