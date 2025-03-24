import { readdirSync, statSync } from 'fs'
import { store } from '../lib/store'
import { extname } from 'path'

export const handleFilesGet = async (): Promise<Array<string>> => {
  const dirPath = store.get('path') as string
  let files = readdirSync(dirPath).map((f) => {
    return {
      filename: f,
      mtime: statSync(dirPath + '/' + f).mtime.getTime()
    }
  })
  files = files.sort((a, b) => b.mtime - a.mtime)
  const markdownFiles = files.filter((f) => extname(f.filename) === '.md')

  return markdownFiles.map((f) => f.filename.replace('.md', ''))
}
