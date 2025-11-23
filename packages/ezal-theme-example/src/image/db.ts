import path from 'node:path';
import DB from 'better-sqlite3';
import { getThemeConfig } from '../config';

export interface ImageMetadata {
	path: string;
	hash: string;
	width: number;
	height: number;
	color: string | null;
}

let db: DB.Database;
let statements: Record<'get' | 'update' | 'delete', DB.Statement>;

function getMetadata(url: string): ImageMetadata | null {
	return statements.get.get(url) as ImageMetadata | null;
}

function updateMetadata(data: ImageMetadata): boolean {
	return (
		statements.update.run(
			data.path,
			data.hash,
			data.width,
			data.height,
			data.color,
		).changes !== 0
	);
}

function deleteMetadata(url: string): boolean {
	return statements.delete.run(url).changes !== 0;
}

function initImageMetadataDB() {
	let filename =
		getThemeConfig().imageCache?.metadata ?? 'image-metadata.sqlite';
	if (!path.isAbsolute(filename)) filename = path.resolve(filename);
	db = new DB(filename);
	db.exec(`CREATE TABLE IF NOT EXISTS image_metadata (
		path TEXT PRIMARY KEY,
		hash TEXT NOT NULL,
		width INTEGER NOT NULL,
		height INTEGER NOT NULL,
		color TEXT(8)
	)`);
	statements = {
		get: db.prepare('SELECT * FROM image_metadata WHERE path = ?'),
		delete: db.prepare('DELETE FROM image_metadata WHERE path = ?'),
		update: db.prepare(`INSERT OR REPLACE INTO image_metadata
			(path, hash, width, height, color)
			VALUES (?, ?, ?, ?, ?)
		`),
	};
}

export const imageDB = {
	init: initImageMetadataDB,
	get: getMetadata,
	update: updateMetadata,
	delete: deleteMetadata,
};
