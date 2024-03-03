import { divider, postToDeleteTag, quotedTag } from '.'

export interface PostData {
  title: string
  tags: string[]
  postId: string | null
  content: string
  isToDelete: boolean
}

export function preparePost(content: string, title: string) {
  if (title.trim().length < 2) {
    throw new Error('Title must have at least 2 characters')
  }

  const postData: PostData = {
    title: title.split('.')[0],
    tags: [],
    postId: null,
    content: '',
    isToDelete: false,
  }

  const [header, body] = content.split(divider)

  if (body.trim().length < 2) {
    throw new Error('Body must have at least 2 characters')
  }

  postData.content = `${body.replace(/\\\\n/g, '\n')}`

  const headerLines = header.split('\n').filter((l) => l !== '' && l !== '---')
  const [, postIdInLine, ...tagsInLine] = headerLines

  const postId = postIdInLine.split(' ')[1]
  postData.postId = postId ?? null

  tagsInLine.forEach((l, i) => {
    if (i !== 0) {
      const rawTag = l.replace(/"/g, '')
      const tag = rawTag.split('-')[1].trim().replace('#', '')

      if (tag !== quotedTag) postData.tags.push(tag)
    }
  })

  if (postData.tags.includes(postToDeleteTag)) {
    postData.isToDelete = true
  }

  return postData
}
