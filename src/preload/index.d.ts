import { ElectronAPI } from '@electron-toolkit/preload'
import { File } from '@renderer/components/Page'

interface API {
  openFile: () => Promise<void>
  getFiles: () => Promise<Array<File>>
  getBody: (string) => Promise<string>
  writeFile: (string, string, string) => Promise<boolean>
  createFile: (title?) => Promise<File>
  deleteFile: (string) => Promise<boolean>
  getSidebarState: () => Promise<boolean>
  fetch: (string) => Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
