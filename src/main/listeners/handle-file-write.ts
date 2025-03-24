import { join } from 'path'
import { store } from '../lib/store'
import { promises, readdirSync, statSync } from 'fs'

export const handleFileWrite = async (
  _: Electron.IpcMainInvokeEvent,
  filename: string,
  body: string,
  id: string
): Promise<boolean> => {
  const dirPath = store.get('path') as string
  const files = readdirSync(dirPath).map((f) => {
    const stats = statSync(dirPath + '/' + f)
    return {
      id: `${stats.dev}-${stats.ino}`,
      filename: f,
      mtime: stats.mtime.getTime()
    }
  })

  const newFilePath = join(dirPath, `${filename}.md`)
  const oldFilePath = join(dirPath, files.find((f) => f.id === id)!.filename!)

  await promises.rename(oldFilePath, newFilePath)
  await promises.writeFile(newFilePath, body, 'utf-8')

  return true
}
