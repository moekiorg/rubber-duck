import { promises } from 'fs'
import { store } from '../lib/store'
import { join } from 'node:path'

export const handleFileDelete = async (
  _: Electron.IpcMainInvokeEvent,
  filename: string
): Promise<boolean> => {
  const dirPath = store.get('path') as string
  const filePath = join(dirPath, `${filename}.md`)

  try {
    await promises.unlink(filePath)
    return true
  } catch (error) {
    console.error(`Failed to delete file: ${error}`)
    return false
  }
}
