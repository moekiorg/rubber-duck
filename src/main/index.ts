import { app, BrowserWindow, ipcMain, Menu } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createWindow } from './lib/create-window'
import { handleDirOpen } from './listeners/handle-dir-open'
import { handleFilesGet } from './listeners/handle-files-get'
import { handleBodyGet } from './listeners/handle-body-get'
import { handleFileWrite } from './listeners/handle-file-write'
import { handleFileCreate } from './listeners/handle-file-create'
import { handleFileDelete } from './listeners/handle-file-delete'
import { store } from './lib/store'
import { FSWatcher, watch } from 'fs'

let watcher: FSWatcher | null = null
let mainWindow: BrowserWindow

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  mainWindow = createWindow()

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  if (store.get('sidebar') === undefined) {
    store.set('sidebar', true)
  }

  ipcMain.on('show-context-menu', (event, id) => {
    const menu = Menu.buildFromTemplate([
      {
        label: 'Delete',
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
  ipcMain.handle('getSidebarState', () => store.get('sidebar'))
  ipcMain.handle('fetch', (_: Electron.IpcMainInvokeEvent, title: string) => {
    mainWindow?.webContents.send('replace', title)
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

export { mainWindow }
