#!/usr/bin/env node
import "dotenv/config";
import path from "node:path";
import axios from "axios";
import { createPost } from "./createPost";
import { preparePost } from "./preparePost";
import { readMarkdownFile } from "./readMarkdownFile";
import { scanDir } from "./scanDir";
import { setPostAsDeleted } from "./setPostAsDeleted";
import { setPostAsError } from "./setPostAsError";
import { setPostAsPublished } from "./setPostAsPublished";

export const baseDir = process.env.BASE_DIR ?? "";
export const quotesFolderName = process.env.QUOTES_FOLDER_NAME ?? "";

export const divider = process.env.DIVIDER ?? "";
export const quotedTag = process.env.QUOTED_TAG ?? "";
export const publishedTag = process.env.PUBLISHED_TAG ?? "";
export const errorTag = process.env.ERROR_TAG ?? "";
export const postToDeleteTag = process.env.POST_TO_DELETE_TAG ?? "";
export const deletedTag = process.env.DELETED_TAG ?? "";
export const postIdHeaderName = process.env.POST_ID_HEADER_NAME ?? "";
export const baseURL = process.env.BASE_URL ?? "";

export const quotesDir = path.join(baseDir, quotesFolderName);

export const api = axios.create({
	baseURL,
	headers: {
		"x-api-key": process.env.API_KEY ?? "",
	},
});

api.interceptors.response.use(
	(res) => res,
	(error) => {
		if (error.response?.data) {
			return Promise.resolve(error.response);
		}

		const err = {
			message: "Não foi possível se conectar com o servidor!",
		};
		return Promise.resolve(err);
	},
);

async function bootstrap() {
	const filesPath = scanDir(quotesDir).filter(
		(filePath) => path.extname(filePath) === ".md",
	);

	for (const filePath of filesPath) {
		const fileContent = readMarkdownFile(filePath);
		const postData = preparePost(fileContent, path.basename(filePath));

		if (postData.isToDelete) {
			if (!postData.postId) throw new Error("No postId to delete");
			const response = await api.delete(`posts/${postData.postId}`);

			if (response.data?.ok) {
				setPostAsDeleted(fileContent, filePath);
			}

			if (response.status !== 200) {
				setPostAsError(fileContent, filePath, `${response.data}`);
			}

			return;
		}

		if (postData.postId) {
			const response = await api.put(`posts/${postData.postId}`, postData);

			if (response.data?.ok && response.data?.postId) {
				setPostAsPublished(fileContent, postData.postId, filePath);
			} else {
				setPostAsError(fileContent, filePath, `${response.data}`);
			}

			return;
		}

		const response = await createPost(postData);

		if (response.data?.ok && response.data?.postId) {
			setPostAsPublished(fileContent, response.data.postId, filePath);
		} else {
			setPostAsError(fileContent, filePath, `${response.data}`);
		}
	}
}

bootstrap();
// cron.schedule("*/30 * * * * *", bootstrap);
