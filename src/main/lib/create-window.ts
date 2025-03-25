import { is } from '@electron-toolkit/utils'
import { BrowserWindow, Menu, shell } from 'electron'
import { join } from 'path'
import icon from '../../../build/icon.png?asset'
import { menu } from '../menu'

export const createWindow = (): BrowserWindow => {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    transparent: true,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  Menu.setApplicationMenu(menu)

  return mainWindow
}
