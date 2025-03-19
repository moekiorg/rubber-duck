import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

const api = {
  openFile: (): Promise<void> => ipcRenderer.invoke('dialog:openDir'),
  getFiles: (): Promise<Array<string>> => ipcRenderer.invoke('getFiles'),
  getBody: (title: string): Promise<string> => ipcRenderer.invoke('getBody', title),
  writeFile: (title: string, body: string, previousTitle: string): Promise<boolean> =>
    ipcRenderer.invoke('writeFile', title, body, previousTitle),
  createFile: (): Promise<string> => ipcRenderer.invoke('createFile'),
  deleteFile: (title): Promise<boolean> => ipcRenderer.invoke('deleteFile', title),
  getSidebarState: (): Promise<boolean> => ipcRenderer.invoke('getSidebarState')
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
