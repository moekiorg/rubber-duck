import { join } from 'path'
import { store } from '../lib/store'
import { promises, readdirSync } from 'fs'

export const handleFileCreate = async (): Promise<string> => {
  const dirPath = store.get('path') as string
  let counter = 0
  let newFilePath: string
  let title: string

  do {
    title = counter === 0 ? 'Untitled' : `Untitled${counter}`
    newFilePath = join(dirPath, `${title}.md`)
    counter++
  } while (readdirSync(dirPath).includes(newFilePath.split('/').pop()!))

  await promises.writeFile(newFilePath, '', 'utf-8')

  return title
}
