import { join } from 'path'
import { store } from '../lib/store'
import { promises, readdirSync, statSync } from 'fs'
import { replaceInFileSync } from 'replace-in-file'

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

  const targetFile = files.find((f) => f.id === id)
  const newFilePath = join(dirPath, `${filename}.md`)
  const oldFilePath = join(dirPath, targetFile!.filename)

  if (files.find((f) => f.id !== id && f.filename === filename)) {
    return false
  }

  if (newFilePath !== oldFilePath) {
    await promises.rename(oldFilePath, newFilePath)
    if (store.get('linkAutoUpdate')) {
      replaceInFileSync({
        files: join(dirPath, '*.md'),
        from: new RegExp(`\\[\\[${targetFile!.filename.replace('.md', '')}\\]\\]`, 'g'),
        to: `[[${filename}]]`
      })
    }
  }
  await promises.writeFile(newFilePath, body, 'utf-8')

  return true
}
