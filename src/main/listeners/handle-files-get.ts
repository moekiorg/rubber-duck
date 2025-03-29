import { readdirSync, statSync, watch } from 'fs'
import { store } from '../lib/store'
import { extname } from 'path'
import { mainWindow } from '..'

export interface File {
  id: string
  title: string
}

export const handleFilesGet = async (watcher): Promise<Array<File>> => {
  if (watcher) {
    watcher.close()
  }

  watcher = watch(store.get('path') as string, (eventType, filename) => {
    if (filename && eventType === 'change') {
      mainWindow?.webContents.send('file-event:change', filename.replace(/.md$/, ''))
    }
  })

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
