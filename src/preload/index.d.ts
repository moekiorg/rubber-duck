import { ElectronAPI } from '@electron-toolkit/preload'
import { File } from '@renderer/components/Page'

interface RubberDuck {
  editorStyles: Array<TagStyle>
  files: Array<File>
  isCompleting: boolean
}

interface API {
  openFile: () => Promise<void>
  getFiles: () => Promise<Array<File>>
  getBody: (string) => Promise<string>
  writeFile: (string, string, string) => Promise<boolean>
  createFile: (title?) => Promise<File>
  deleteFile: (string) => Promise<boolean>
  getConfig: (string) => Promise<string>
  setConfig: (string, string) => Promise<void>
  fetch: (string) => Promise<void>
  getJs: () => Promise<Array<string>>
  getCss: () => Promise<Array<string>>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
    rubberDuck: RubberDuck
  }
}
