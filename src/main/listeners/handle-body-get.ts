import { join } from 'path'
import { store } from '../lib/store'
import { promises } from 'fs'

export const handleBodyGet = async (
  _: Electron.IpcMainInvokeEvent,
  filename: string
): Promise<string> => {
  const dirPath = store.get('path') as string
  const filePath = join(dirPath, `${filename}.md`)
  const fileContent = await promises.readFile(filePath, 'utf-8')
  return fileContent
}
