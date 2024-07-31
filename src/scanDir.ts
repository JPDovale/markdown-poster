import { readdirSync } from "node:fs";
import path from "node:path";

export function scanDir(dir: string) {
	const files: string[] = [];

	function scan(subdir = "") {
		const fullPath = path.resolve(dir, subdir);

		const dirEntries = readdirSync(fullPath, { withFileTypes: true });

		for (const dirEntry of dirEntries) {
			if (dirEntry.isDirectory()) {
				scan(dirEntry.name);
			} else {
				files.push(dirEntry.path.concat(`/${dirEntry.name}`));
			}
		}
	}

	scan();

	return files;
}
