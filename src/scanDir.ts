import { readdirSync } from 'fs'
import path from 'path'

export function scanDir(dir: string) {
  console.log('> Scanning directory', dir)

  const files: string[] = []

  function scan(subdir: string = '') {
    const fullPath = path.resolve(dir, subdir)

    const dirEntries = readdirSync(fullPath, { withFileTypes: true })

    for (const dirEntry of dirEntries) {
      if (dirEntry.isDirectory()) {
        scan(dirEntry.name)
      } else {
        files.push(dirEntry.path.concat(`/${dirEntry.name}`))
      }
    }
  }

  scan()

  return files
}
