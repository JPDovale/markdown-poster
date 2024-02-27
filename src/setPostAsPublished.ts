import { existsSync, writeFileSync } from 'fs'
import { publishedTag, quotedTag } from '.'
import { replacePostId } from './replacePostId'

export function setPostAsPublished(
  content: string,
  postId: string,
  filePath: string,
) {
  console.log('> Set post as published', postId)

  const newContent = replacePostId(
    content.replace(quotedTag, publishedTag),
    postId,
  )

  if (!existsSync(filePath)) {
    throw new Error('File does not exist')
  }

  writeFileSync(filePath, newContent)
}
