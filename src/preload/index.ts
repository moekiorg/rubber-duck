import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

export interface File {
  id: string
  title: string
  mtime: string
}

const api = {
  openFile: (): Promise<void> => ipcRenderer.invoke('dialog:openDir'),
  getFiles: (): Promise<Array<File>> => ipcRenderer.invoke('getFiles'),
  getBody: (id: string): Promise<string> => ipcRenderer.invoke('getBody', id),
  writeFile: (title: string, body: string, id: string): Promise<boolean> =>
    ipcRenderer.invoke('writeFile', title, body, id),
  createFile: (title: string): Promise<File> => ipcRenderer.invoke('createFile', title),
  deleteFile: (title): Promise<boolean> => ipcRenderer.invoke('deleteFile', title),
  getSidebarState: (): Promise<boolean> => ipcRenderer.invoke('getSidebarState'),
  fetch: (title): Promise<void> => ipcRenderer.invoke('fetch', title)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
