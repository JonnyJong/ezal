import { spawn } from 'node:child_process';
import path, { isAbsolute } from 'node:path';
import { defineConfig, type Plugin, type RolldownOptions } from 'rolldown';

const sharedOptions: RolldownOptions = {
	external: (id) => !isAbsolute(id) && id[0] !== '.',
};

const TSC_ROOT = path.join(
	import.meta.dirname,
	'packages/ezal/node_modules/typescript/lib/tsc.js',
);

function tscAfter(mod: string): Plugin {
	return {
		name: 'tsc-after',
		writeBundle() {
			return new Promise((resolve, reject) => {
				const args = [TSC_ROOT, '-p', `packages/${mod}/tsconfig.json`];
				const ps = spawn('node', args, { stdio: 'inherit', shell: false });
				ps.on('close', (code) => {
					if (code === 0) resolve();
					else reject(new Error(`tsc exited with code ${code}`));
				});
				ps.on('error', reject);
			});
		},
	};
}

function generate(mod: string): RolldownOptions {
	return {
		input: `packages/${mod}/src/index.ts`,
		output: {
			dir: `packages/${mod}/dist`,
			format: 'cjs',
			cleanDir: true,
			sourcemap: true,
		},
		...sharedOptions,
		plugins: [tscAfter(mod)],
	};
}

export default defineConfig([
	generate('ezal'),
	generate('ezal-theme-example'),
	{
		...generate('ezal-layout'),
		input: [
			'packages/ezal-layout/src/index.ts',
			'packages/ezal-layout/src/wrap.ts',
			'packages/ezal-layout/src/build.ts',
			'packages/ezal-layout/src/runtime.ts',
			'packages/ezal-layout/src/render.ts',
		],
	},
]);
