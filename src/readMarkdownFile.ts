import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export function readMarkdownFile(filepath: string) {
	const ext = path.extname(filepath);
	if (ext !== ".md") {
		throw new Error("File must be a markdown file");
	}

	if (!existsSync(filepath)) {
		throw new Error("File does not exist");
	}

	const file = readFileSync(filepath, "utf8");
	return file;
}
