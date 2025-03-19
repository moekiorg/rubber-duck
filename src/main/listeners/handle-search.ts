import { mainWindow } from '..'

export const handleSearch = async (): Promise<void> => {
  mainWindow?.webContents.send('search')
}
