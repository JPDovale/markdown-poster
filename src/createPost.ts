import { api } from '.'
import { PostData } from './preparePost'

export async function createPost(postData: PostData) {
  return await api.post('/posts', postData)
}
