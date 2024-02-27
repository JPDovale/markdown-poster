import { existsSync, writeFileSync } from 'fs'
import { deletedTag, postToDeleteTag } from '.'
import { replacePostId } from './replacePostId'

export function setPostAsDeleted(content: string, filePath: string) {
  console.log('> Setting post as deleted...', filePath)

  const newContent = replacePostId(
    content.replace(postToDeleteTag, deletedTag),
    '',
  )

  if (!existsSync(filePath)) {
    throw new Error('File does not exist')
  }

  writeFileSync(filePath, newContent)
}
