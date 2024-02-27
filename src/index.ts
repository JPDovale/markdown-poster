#!/usr/bin/env node
import 'dotenv/config'
import axios from 'axios'
import path from 'path'
import cron from 'node-cron'
import { readMarkdownFile } from './readMarkdownFile'
import { createPost } from './createPost'
import { setPostAsPublished } from './setPostAsPublished'
import { preparePost } from './preparePost'
import { setPostAsError } from './setPostAsError'
import { setPostAsDeleted } from './setPostAsDeleted'
import { scanDir } from './scanDir'

export const quotesFolderName = process.env.QUOTES_FOLDER_NAME ?? ''
export const baseDir = process.env.BASE_DIR ?? ''

export const divider = process.env.DIVIDER ?? ''
export const quotedTag = process.env.QUOTED_TAG ?? ''
export const publishedTag = process.env.PUBLISHED_TAG ?? ''
export const errorTag = process.env.ERROR_TAG ?? ''
export const postToDeleteTag = process.env.POST_TO_DELETE_TAG ?? ''
export const deletedTag = process.env.DELETED_TAG ?? ''
export const postIdHeaderName = process.env.POST_ID_HEADER_NAME ?? ''
export const baseURL = process.env.BASE_URL ?? ''

export const quotesDir = path.join(baseDir, quotesFolderName)

export const api = axios.create({
  baseURL,
  headers: {
    'x-api-key': process.env.API_KEY ?? '',
  },
})

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response && error.response.data) {
      return Promise.resolve(error.response)
    }

    const err = {
      message: 'Não foi possível se conectar com o servidor!',
    }
    return Promise.resolve(err)
  },
)

async function bootstrap() {
  const filesPath = scanDir(quotesDir)

  for (const filePath of filesPath) {
    const fileContent = readMarkdownFile(filePath)
    const postData = preparePost(fileContent, path.basename(filePath))

    if (postData.isToDelete) {
      console.log('> Deleting post', postData.postId)

      if (!postData.postId) throw new Error('No postId to delete')
      const response = await api.delete(`posts/${postData.postId}`)

      if (response.data?.ok) {
        setPostAsDeleted(fileContent, filePath)
      }

      if (response.status !== 200) {
        setPostAsError(fileContent, filePath, `${response.data}`)
      }

      return
    }

    if (postData.postId) {
      console.log('> Updating post', postData.postId)

      const response = await api.put(`posts/${postData.postId}`, postData)

      if (response.data?.ok && response.data?.postId) {
        setPostAsPublished(fileContent, postData.postId, filePath)
      } else {
        setPostAsError(fileContent, filePath, `${response.data}`)
      }

      return
    }

    console.log('> Creating post for file', filePath)

    const response = await createPost(postData)

    if (response.data?.ok && response.data?.postId) {
      setPostAsPublished(fileContent, response.data.postId, filePath)
    } else {
      setPostAsError(fileContent, filePath, `${response.data}`)
    }
  }

  console.log("> Finished. It's time to sleep. (or just sleep)")
}

cron.schedule('*/30 * * * * *', bootstrap)
