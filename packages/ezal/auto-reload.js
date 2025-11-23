try {
	const sse = new EventSource('/');
	let connected = false;

	window.addEventListener('beforeunload', () => sse.close());

	sse.onmessage = (event) => {
		const data = JSON.parse(event.data);
		if (data.type === 'connect') {
			if (connected) {
				location.reload();
				return;
			}
			console.log('Auto Reload Ready');
			connected = true;
			return;
		}
		if (data.type !== 'update') return;
		const file = data.url;
		if (decodeURIComponent(location.pathname) === file) return location.reload();
		for (const element of document.querySelectorAll('link')) {
			if (element.rel !== 'stylesheet') continue;
			const url = new URL(element.href);
			if (decodeURIComponent(url.pathname) !== file) continue;
			url.searchParams.set('ezal', Date.now().toString(36));
			element.href = url;
			return;
		}
		for (const entry of performance.getEntriesByType('resource')) {
			const { pathname } = new URL(entry.name);
			if (decodeURIComponent(pathname) !== file) continue;
			return location.reload();
		}
	};
} catch (error) {
	console.error(error);
}
