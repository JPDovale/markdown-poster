import { existsSync, readFileSync } from 'fs'
import path from 'path'

export function readMarkdownFile(filepath: string) {
  const ext = path.extname(filepath)
  if (ext !== '.md') {
    throw new Error('File must be a markdown file')
  }

  if (!existsSync(filepath)) {
    throw new Error('File does not exist')
  }

  const file = readFileSync(filepath, 'utf8')
  return file
}
