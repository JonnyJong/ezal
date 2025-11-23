export function runParallel<T>(
	tasks: T[],
	fn: (task: T) => Promise<any>,
	maxParallel = 10,
) {
	const total = tasks.length;
	if (total === 0) return;

	let running = 0;
	let nextIndex = 0;
	let finished = 0;
	let rejected = false;

	const finish = (resolve: () => void, reject: (reason?: any) => void) => {
		if (rejected) return;
		running--;
		finished++;
		if (finished === total) return resolve();
		launch(resolve, reject);
	};

	const error = (err: unknown, reject: (reason?: any) => void) => {
		if (rejected) return;
		rejected = true;
		reject(err);
	};

	const launch = (resolve: () => void, reject: (reason?: any) => void) => {
		while (!rejected && running < maxParallel && nextIndex < total) {
			const index = nextIndex++;
			const task = tasks[index];
			running++;
			fn(task)
				.then(() => finish(resolve, reject))
				.catch((err) => error(err, reject));
		}
	};

	return new Promise<void>(launch);
}
