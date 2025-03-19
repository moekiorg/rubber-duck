import { ElectronAPI } from '@electron-toolkit/preload'

interface API {
  openFile: () => Promise<void>
  getFiles: () => Promise<Array<string>>
  getBody: (string) => Promise<string>
  writeFile: (string, string, string) => Promise<boolean>
  createFile: () => Promise<string>
  deleteFile: (string) => Promise<boolean>
  getSidebarState: () => Promise<boolean>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
