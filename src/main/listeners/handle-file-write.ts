import { join } from 'path'
import { store } from '../lib/store'
import { promises, readdirSync } from 'fs'

export let isSelfEditing = false

export const handleFileWrite = async (
  _: Electron.IpcMainInvokeEvent,
  filename: string,
  body: string,
  previousFilename: string
): Promise<boolean> => {
  const dirPath = store.get('path') as string
  const oldFilePath = join(dirPath, `${previousFilename}.md`)
  const newFilePath = join(dirPath, `${filename}.md`)

  if (
    previousFilename !== filename &&
    readdirSync(dirPath).includes(newFilePath.split('/').pop()!)
  ) {
    return false
  }

  isSelfEditing = true

  if (previousFilename !== filename) {
    await promises.rename(oldFilePath, newFilePath)
  }

  await promises.writeFile(newFilePath, body, 'utf-8')

  setTimeout(() => {
    isSelfEditing = false
  }, 100)

  return true
}
