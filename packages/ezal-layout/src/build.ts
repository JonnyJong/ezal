import path from 'node:path';
import esbuild from 'esbuild';

export async function build(src: string, external?: Record<string, any>) {
	const {
		outputFiles,
		metafile: { inputs },
	} = await esbuild.build({
		// Load
		entryPoints: [src],
		loader: { '.tsx': 'tsx', '.ts': 'ts', '.jsx': 'jsx', '.js': 'js' },
		// Output
		bundle: true,
		platform: 'node',
		format: 'cjs',
		target: 'es2024',
		write: false,
		metafile: true,
		sourcemap: 'inline',
		// JSX
		jsxFactory: 'h',
		jsxFragment: 'Fragment',
		// Other
		external: external ? Object.keys(external) : undefined,
		treeShaking: true,
		minify: false,
	});
	const cwd = process.cwd();
	const content = outputFiles[0].text;
	const dependencies = Object.keys(inputs).map((src) => path.join(cwd, src));
	return { content, dependencies };
}
