import { readdirSync } from 'fs'
import { store } from '../lib/store'
import { extname } from 'path'

export const handleFilesGet = async (): Promise<Array<string>> => {
  const dirPath = store.get('path') as string
  const files = readdirSync(dirPath)
  const markdownFiles = files.filter((file: string) => extname(file) === '.md')

  return markdownFiles.map((file: string) => file.replace('.md', ''))
}
