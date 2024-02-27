import { existsSync, writeFileSync } from 'fs'
import { divider, errorTag, postToDeleteTag, quotedTag } from '.'

export function setPostAsError(
  content: string,
  filePath: string,
  message: string,
) {
  console.log('> Set post as error', filePath)

  const newContent = content
    .replace(quotedTag, errorTag)
    .replace(postToDeleteTag, errorTag)
    .concat(`\n\n\n`)
    .concat(divider)
    .concat('\n\n')
    .concat(message)

  if (!existsSync(filePath)) {
    throw new Error('File does not exist')
  }

  writeFileSync(filePath, newContent)
}
