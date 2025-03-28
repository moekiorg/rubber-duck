import { app, BrowserWindow, ipcMain, Menu, net, protocol, shell } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createWindow } from './lib/create-window'
import { handleDirOpen } from './listeners/handle-dir-open'
import { handleFilesGet } from './listeners/handle-files-get'
import { handleBodyGet } from './listeners/handle-body-get'
import { handleFileWrite } from './listeners/handle-file-write'
import { handleFileCreate } from './listeners/handle-file-create'
import { handleFileDelete } from './listeners/handle-file-delete'
import { store } from './lib/store'
import { FSWatcher, readdirSync, watch, writeFileSync } from 'fs'
import { basename, join, normalize } from 'path'
import { intl } from './lib/intl'
import { handleFullTextSearch } from './listeners/handle-full-text-search'

let watcher: FSWatcher | null = null
let mainWindow: BrowserWindow

app.whenReady().then(() => {
  protocol.handle('app', (request: Request): Promise<GlobalResponse> => {
    const url = request.url.replace('app://', 'file:///')
    return net.fetch(normalize(url))
  })

  electronApp.setAppUserModelId('com.electron')

  mainWindow = createWindow()

  mainWindow.setBackgroundMaterial('acrylic')
  mainWindow.setVibrancy('under-window')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  if (store.get('sidebar.visible') === undefined) {
    store.set('sidebar.visible', true)
    store.set('sidebar.width', 200)
  }
  if (store.get('linkAutoUpdate') === undefined) {
    store.set('linkAutoUpdate', true)
  }

  ipcMain.on('show-context-menu', (event, id, title) => {
    const menu = Menu.buildFromTemplate([
      {
        label: intl.formatMessage({ id: 'openInDefaultApp' }),
        click: (): void => {
          const dirPath = store.get('path') as string
          shell.openPath(join(dirPath, `${title}.md`))
        }
      },
      {
        label: intl.formatMessage({ id: 'revealInFinder' }),
        click: (): void => {
          const dirPath = store.get('path') as string
          shell.showItemInFolder(join(dirPath, `${title}.md`))
        }
      },
      {
        type: 'separator'
      },
      {
        label: intl.formatMessage({ id: 'delete' }),
        click: (): void => {
          event.sender.send('delete-file', id)
        }
      }
    ])
    menu.popup({ window: mainWindow! })
  })

  ipcMain.handle('dialog:openDir', handleDirOpen)
  ipcMain.handle('getFiles', () => {
    if (watcher) {
      watcher.close()
    }

    watcher = watch(store.get('path') as string, (eventType, filename) => {
      if (filename && eventType === 'change') {
        mainWindow?.webContents.send('file-event:change', filename.replace(/.md$/, ''))
      }
    })

    return handleFilesGet()
  })
  ipcMain.handle('getBody', handleBodyGet)
  ipcMain.handle('writeFile', handleFileWrite)
  ipcMain.handle('createFile', handleFileCreate)
  ipcMain.handle('deleteFile', handleFileDelete)
  ipcMain.handle('getConfig', (_, key) => store.get(key))
  ipcMain.handle('setConfig', (_, key, value) => store.set(key, value))
  ipcMain.handle('fetch', (_: Electron.IpcMainInvokeEvent, title: string) => {
    mainWindow?.webContents.send('replace', title)
  })
  ipcMain.handle('getJs', async () => {
    try {
      const dirPath = store.get('path') as string
      return readdirSync(join(dirPath, '.text-zen'))
        .filter((file) => file.endsWith('.js'))
        .map((file) => `app://${join(dirPath, '.text-zen', file)}`)
    } catch {
      return []
    }
  })
  ipcMain.handle('getCss', async () => {
    try {
      const dirPath = store.get('path') as string
      return readdirSync(join(dirPath, '.text-zen'))
        .filter((file) => file.endsWith('.css'))
        .map((file) => `app://${join(dirPath, '.text-zen', file)}`)
    } catch {
      return []
    }
  })
  ipcMain.handle('copy-file', async (_, filePath, buffer) => {
    const fileName = basename(filePath)
    const targetPath = join(store.get('path') as string, fileName)

    writeFileSync(targetPath, buffer)

    return targetPath
  })
  ipcMain.handle('searchFullText', async (_, query) => {
    const results = handleFullTextSearch(query)
    return results
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

export { mainWindow }
