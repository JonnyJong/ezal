import {
	createServer,
	type IncomingMessage,
	type OutgoingHttpHeaders,
	type Server,
	type ServerResponse,
} from 'node:http';
import { type NetworkInterfaceInfo, networkInterfaces } from 'node:os';
import path from 'node:path';
import { Readable } from 'node:stream';
import { inspect } from 'node:util';
import mime from 'mime-types';
import { getConfig } from './config';
import { Logger } from './logger';
import { Route, type RouteContent } from './route';
import { error2html } from './utils/error';
import { URL } from './utils/url';

const INFO = {
	UPDATE: 'Broadcast update information:',
};

const ERR = {
	EACCES:
		'Permission denied, usually attempting to bind to a restricted port or an IP/interface without permission',
	EADDRINUSE: 'The specified local address or port is in use',
	EADDRNOTAVAIL: 'The specified local address is not available',
	EAFNOSUPPORT: 'Address family is not supported',
	ENOTFOUND: 'DNS resolution failed for hostname or temporary failure',
	EAI_AGAIN: 'DNS resolution failed for hostname or temporary failure',
	EINVAL:
		'Invalid parameters, port number out of range or invalid address format provided',
	EPERM: 'Operation was denied by the operating system',
} as const;

const CORS_HEADERS = new Map<string, string>([
	['access-control-allow-origin', '*'],
	['access-control-allow-methods', 'GET, POST, PUT, DELETE, OPTIONS'],
	['access-control-allow-headers', 'Content-Type, Authorization'],
]);

const SSE_HEADERS: OutgoingHttpHeaders = {
	'content-type': 'text/event-stream',
	'cache-control': 'no-cache',
	connection: 'keep-alive',
};

const UNSPECIFIED_ADDRESSES = new Set(['0.0.0.0', '::']);

const logger = new Logger('server');

let server: Server;
const clients = new Set<ServerResponse>();

function resolveUrl(url?: string): string | undefined {
	if (!url) return;
	const root = getConfig().site.root;
	if (!root || root === '/') return url;
	if (!url.startsWith(root)) return;
	url = url.slice(root.length);
	if (url.length === 0) return '/';
	if (url[0] !== '/') return;
	return url;
}

function toStream(content: RouteContent): Readable {
	if (content instanceof Readable) return content;
	return Readable.from(content);
}

async function response<
	Request extends typeof IncomingMessage,
	Response extends typeof ServerResponse<InstanceType<Request>>,
>(
	req: InstanceType<Request>,
	res: InstanceType<Response>,
	url: string,
	route: Route,
	code: number,
) {
	const stream = toStream(await route.getContent());
	const ext = path.extname(route.dist).toLowerCase();
	const type = mime.lookup(ext);
	if (type) res.writeHead(code, { 'content-type': type });
	else res.writeHead(code);
	stream.pipe(res);
	stream.on('error', (error) => {
		logger.error(req.method, url, error);
		res.statusCode = 500;
		res.end(inspect(error));
	});
	res.on('error', (error) => {
		logger.error(req.method, url, error);
	});
	res.on('finish', () => {
		logger.log(req.method, url, res.statusCode);
	});
}

async function handleGet<
	Request extends typeof IncomingMessage,
	Response extends typeof ServerResponse<InstanceType<Request>>,
>(
	req: InstanceType<Request>,
	res: InstanceType<Response>,
	url: string | undefined,
) {
	if (!url) {
		logger.warn('Bad request');
		res.writeHead(400);
		res.end('Bad Request: Missing URL');
		return;
	}
	const routeUrl = resolveUrl(url);
	if (!routeUrl) {
		logger.warn(`Requesting out of root: ${url}`);
		res.writeHead(400);
		res.end('Bad Request: Out of Root');
		return;
	}
	url = routeUrl;
	logger.timeStart(res);
	let route = Route.find(url);
	if (route) {
		await response(req, res, url, route, 200);
		logger.timeEnd(res, 1000, url);
		return;
	}
	route = Route.find('/404.html');
	if (route) {
		await response(req, res, url, route, 404);
		logger.timeEnd(res, 1000, url);
		return;
	}
	res.writeHead(404);
	res.end(await error2html(new Error('Not Found', { cause: url })));
	logger.warn(req.method, url, 404);
	logger.timeEnd(res, 1000, url);
}

function handleSSE<
	Request extends typeof IncomingMessage,
	Response extends typeof ServerResponse<InstanceType<Request>>,
>(req: InstanceType<Request>, res: InstanceType<Response>) {
	res.writeHead(200, SSE_HEADERS);
	logger.log(
		'Initializing SSE connection...',
		req.socket.localAddress,
		'[local] --> [remote]',
		req.socket.remoteAddress,
	);
	res.write('data: {"type":"connect"}\n\n');
	clients.add(res);
	const heartbeat = setInterval(() => {
		if (res.writableEnded) {
			clearInterval(heartbeat);
			return;
		}
		res.write('data: {"type":"heartbeat"}\n\n');
	}, 10000);
	req.on('close', () => {
		clearInterval(heartbeat);
		clients.delete(res);
		if (res.errored || req.errored) return;
		logger.log(
			'SSE connection closed',
			req.socket.remoteAddress,
			'<->',
			req.socket.localAddress,
		);
	});
	res.on('error', (error) => {
		logger.error(
			'SSE connection error',
			error,
			req.socket.remoteAddress,
			'<->',
			req.socket.localAddress,
		);
	});
}

async function requestHandle<
	Request extends typeof IncomingMessage,
	Response extends typeof ServerResponse<InstanceType<Request>>,
>(req: InstanceType<Request>, res: InstanceType<Response>) {
	const url = req.url ? URL.clean(URL.decode(req.url)) : undefined;
	res.setHeaders(CORS_HEADERS);
	if (req.method === 'OPTIONS') {
		res.writeHead(200);
		res.end();
		logger.log(req.method, url, 200);
		return;
	}
	if (req.method !== 'GET') {
		res.writeHead(405);
		res.end('Method Not Allowed');
		logger.error(req.method, url, 405);
		return;
	}
	try {
		if (req.headers.accept === 'text/event-stream') handleSSE(req, res);
		else await handleGet(req, res, url);
	} catch (error) {
		if (!res.writableEnded) {
			res.writeHead(500);
			res.end(await error2html(error));
		}
		logger.timeEnd(res, 1000, url);
		logger.error(req.method, url, error);
	}
}

function printAddresses(port: number, root: string) {
	const addresses = Object.values(networkInterfaces())
		.filter((v): v is NetworkInterfaceInfo[] => !!v)
		.flat();
	let output = 'Ready on:';
	const push = (host: string) => {
		output += `\n\thttp://${host}:${port}${root}`;
	};
	push('localhost');
	push('127.0.0.1');
	push('[::1]');
	for (const address of addresses) {
		if (address.internal) continue;
		if (address.address.startsWith('fe80')) continue;
		push(address.family === 'IPv4' ? address.address : `[${address.address}]`);
	}
	logger.log(output);
}

export function initServer() {
	server = createServer(requestHandle);
	server.on('error', (error) => {
		if (!('code' in error) || typeof error.code !== 'string') return;
		const message = (ERR as any)[error.code];
		if (message) logger.fatal(message, error);
	});
	const config = getConfig().server;
	const port = config?.port ?? 8080;
	const host = config?.host ?? 'localhost';
	const root = getConfig().site.root ?? '/';
	if (UNSPECIFIED_ADDRESSES.has(host)) {
		server.listen(port, () => printAddresses(port, root));
		return;
	}
	server.listen(port, host, () => {
		logger.log(`Ready on http://${host}:${port}${root}`);
	});
}

function broadcast(message: any) {
	for (const client of clients) {
		client.write(`data: ${JSON.stringify(message)}\n\n`);
	}
}

export function broadcastUpdate(url: string) {
	logger.debug(INFO.UPDATE, url);
	const root = getConfig().site.root;
	if (root) url = URL.join(root, url);
	broadcast({ type: 'update', url });
}

export async function stopServer(): Promise<Error | null> {
	if (!server) return null;
	await Promise.allSettled(
		[...clients].map((client) => new Promise((resolve) => client.end(resolve))),
	);
	return new Promise((resolve) =>
		server.close((error) => resolve(error ?? null)),
	);
}
