import { readdirSync, statSync } from 'fs'
import { store } from '../lib/store'
import { extname } from 'path'

export interface File {
  id: string
  title: string
}

export const handleFilesGet = async (): Promise<Array<File>> => {
  const dirPath = store.get('path') as string
  let files = readdirSync(dirPath).map((f) => {
    const stats = statSync(dirPath + '/' + f)
    return {
      id: `${stats.dev}-${stats.ino}`,
      filename: f,
      mtime: stats.mtime.getTime()
    }
  })
  files = files.sort((a, b) => b.mtime - a.mtime)
  const markdownFiles = files.filter((f) => extname(f.filename) === '.md')

  return markdownFiles.map((f) => {
    return { id: f.id, title: f.filename.replace('.md', ''), mtime: f.mtime }
  })
}
