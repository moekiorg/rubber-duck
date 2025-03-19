import { app, Menu } from 'electron'
import { handleDirOpen } from './listeners/handle-dir-open'
import { handleSearch } from './listeners/handle-search'
import { mainWindow } from '.'
import { store } from './lib/store'

const template = [
  {
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideOthers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  {
    label: 'File',
    submenu: [
      { click: handleDirOpen, label: 'Open Folder...', accelerator: 'Cmd+O' },
      {
        click: (): void => {
          mainWindow?.webContents.send('new')
        },
        label: 'New File',
        accelerator: 'Cmd+N'
      },
      { click: handleSearch, label: 'Search', accelerator: 'Cmd+P' },
      { type: 'separator' },
      { role: 'close' }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'pasteAndMatchStyle' },
      { role: 'delete' },
      { role: 'selectAll' },
      { type: 'separator' },
      {
        label: 'Speech',
        submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }]
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        click: (): void => {
          store.set('sidebar', !store.get('sidebar'))
          mainWindow?.webContents.send('toggle-sidebar', store.get('sidebar'))
        },
        label: 'Sidebar',
        accelerator: 'Cmd+B',
        checked: await store.get('sidebar')
      },
      { type: 'separator' },
      { role: 'reload' },
      { role: 'forceReload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      { type: 'separator' },
      { role: 'front' },
      { type: 'separator' },
      { role: 'window' }
    ]
  }
] as Array<Electron.MenuItemConstructorOptions | Electron.MenuItem>

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

export { menu }
