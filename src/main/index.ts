import { app, BrowserWindow, ipcMain, net, protocol } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createWindow } from './lib/create-window'
import { handleDirOpen } from './listeners/handle-dir-open'
import { handleBodyGet } from './listeners/handle-body-get'
import { handleFileWrite } from './listeners/handle-file-write'
import { handleFileCreate } from './listeners/handle-file-create'
import { handleFileDelete } from './listeners/handle-file-delete'
import { store } from './lib/store'
import { FSWatcher } from 'fs'
import { normalize } from 'path'
import { handleFullTextSearch } from './listeners/handle-full-text-search'
import { initializeConfig } from './lib/initialize-config'
import { createMenu } from './lib/create-menu'
import { handleFilesGet } from './listeners/handle-files-get'
import { handleFetch } from './listeners/handle-fetch'
import { handleJsGet } from './listeners/handle-js-get'
import { handleCssGet } from './listeners/handle-css-get'
import { handleFileCopy } from './listeners/handle-file-copy'

const watcher: FSWatcher | null = null
let mainWindow: BrowserWindow

app.whenReady().then(() => {
  protocol.handle('zen', (request: Request): Promise<GlobalResponse> => {
    const url = request.url.replace('zen://', 'file:///')
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
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })

  initializeConfig()

  ipcMain.on('show-context-menu', (event, id, title) => {
    const menu = createMenu(event, id, title)
    menu.popup({ window: mainWindow! })
  })

  ipcMain.handle('dialog:openDir', handleDirOpen)
  ipcMain.handle('getFiles', () => handleFilesGet(watcher))
  ipcMain.handle('getBody', handleBodyGet)
  ipcMain.handle('writeFile', handleFileWrite)
  ipcMain.handle('createFile', handleFileCreate)
  ipcMain.handle('deleteFile', handleFileDelete)
  ipcMain.handle('getConfig', (_, key) => store.get(key))
  ipcMain.handle('setConfig', (_, key, value) => store.set(key, value))
  ipcMain.handle('fetch', handleFetch)
  ipcMain.handle('getJs', handleJsGet)
  ipcMain.handle('getCss', handleCssGet)
  ipcMain.handle('copy-file', handleFileCopy)
  ipcMain.handle('searchFullText', handleFullTextSearch)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

export { mainWindow }
