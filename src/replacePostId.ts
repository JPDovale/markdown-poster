import { postIdHeaderName } from ".";

export function replacePostId(content: string, postId: string) {
	const lines = content.split("\n");
	const postIdLineIndex = lines.findIndex((line) =>
		line.includes(postIdHeaderName),
	);

	lines[postIdLineIndex] = `${postIdHeaderName}: ${postId}`;

	return lines.join("\n");
}
